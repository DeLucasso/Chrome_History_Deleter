/*
  Chrome History Deleter Extension
  (c) 2025 delucasso - https://x.com/DeLucasso
  Licensed under MIT License
*/

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const btnClear = document.getElementById("btnClear");
  const btnFind = document.getElementById("btnFind");
  const btnAddDomain = document.getElementById("btnAddDomain");
  const btnTrashListed = document.getElementById("btnTrashListed");
  const log = document.getElementById("log");
  const trashList = document.getElementById("trashList");
  const domainInput = document.getElementById("domainInput");
  const query = document.getElementById("query");
  const helpIcon = document.getElementById("helpIcon");
  const helpTooltip = document.getElementById("helpTooltip");

  // Start time is 20 years ago to cover all history
  const startTime = new Date().getTime() - 20 * 365 * 24 * 60 * 60 * 1000;

  // Domain trash list storage key
  const TRASH_LIST_KEY = "domain_trash_list";

  // Adjust popup height based on content
  function adjustPopupHeight() {
    const container = document.querySelector('.container');
    const viewportHeight = window.screen.height;
    const maxHeight = Math.min(600, viewportHeight * 0.8);
    
    // Calculate content height
    const contentHeight = container.scrollHeight + 30; // 30px for padding
    const finalHeight = Math.min(contentHeight, maxHeight);
    
    document.body.style.height = Math.max(400, finalHeight) + 'px';
    
    // Adjust trash list height based on available space
    const usedHeight = 200; // Approximate height of other elements
    const availableHeight = finalHeight - usedHeight;
    const trashListMaxHeight = Math.max(100, Math.min(300, availableHeight));
    
    trashList.style.maxHeight = trashListMaxHeight + 'px';
  }

  // Initialize
  loadTrashList();
  adjustPopupHeight();

  // Set up event listeners
  btnClear.addEventListener("click", function() {
    const queryText = query.value.trim();
    deleteHistory(queryText);
  });

  btnFind.addEventListener("click", function() {
    const queryText = query.value.trim();
    findHistory(queryText);
  });

  btnAddDomain.addEventListener("click", addDomain);
  btnTrashListed.addEventListener("click", trashListedDomains);
  
  // Help icon toggle
  helpIcon.addEventListener("click", function() {
    if (helpTooltip.style.display === "none") {
      helpTooltip.style.display = "block";
    } else {
      helpTooltip.style.display = "none";
    }
  });

  // Add keyboard shortcuts
  query.addEventListener("keyup", function(e) {
    if (e.key === "Enter") {
      findHistory(query.value.trim());
    }
  });

  domainInput.addEventListener("keyup", function(e) {
    if (e.key === "Enter") {
      addDomain();
    }
  });

  // Load saved trash list from storage
  function loadTrashList() {
    chrome.storage.local.get([TRASH_LIST_KEY], function(result) {
      const domains = result[TRASH_LIST_KEY] || [];
      renderTrashList(domains);
    });
  }

  // Save trash list to storage
  function saveTrashList(domains) {
    chrome.storage.local.set({ [TRASH_LIST_KEY]: domains }, function() {
      renderTrashList(domains);
    });
  }

  // Render the trash list in the UI
  function renderTrashList(domains) {
    trashList.innerHTML = "";
    
    if (domains.length === 0) {
      trashList.innerHTML = "<div style='text-align: center; color: #777; padding: 10px;'>No domains added yet</div>";
      setTimeout(adjustPopupHeight, 10);
      return;
    }
    
    domains.forEach((domain, index) => {
      const domainItem = document.createElement("div");
      domainItem.className = "domain-item";
      
      const domainText = document.createElement("span");
      domainText.textContent = domain;
      
      const removeBtn = document.createElement("button");
      removeBtn.className = "secondary";
      removeBtn.style.minWidth = "auto";
      removeBtn.style.padding = "3px 8px";
      removeBtn.style.fontSize = "12px";
      removeBtn.textContent = "Remove";
      removeBtn.onclick = function() { removeDomain(index); };
      
      domainItem.appendChild(domainText);
      domainItem.appendChild(removeBtn);
      trashList.appendChild(domainItem);
    });
    
    // Adjust height after rendering
    setTimeout(adjustPopupHeight, 10);
  }

  // Add a domain to the trash list
  function addDomain() {
    const domain = domainInput.value.trim();
    
    if (!domain) {
      logMessage("Please enter a domain", "error");
      return;
    }
    
    chrome.storage.local.get([TRASH_LIST_KEY], function(result) {
      const domains = result[TRASH_LIST_KEY] || [];
      
      if (domains.includes(domain)) {
        logMessage(`"${domain}" is already in the trash list`, "error");
        return;
      }
      
      domains.push(domain);
      saveTrashList(domains);
      domainInput.value = "";
      
      logMessage(`"${domain}" added to trash list`, "success");
    });
  }

  // Remove a domain from the trash list
  function removeDomain(index) {
    chrome.storage.local.get([TRASH_LIST_KEY], function(result) {
      const domains = result[TRASH_LIST_KEY] || [];
      const removed = domains.splice(index, 1)[0];
      saveTrashList(domains);
      
      logMessage(`"${removed}" removed from trash list`, "info");
    });
  }

  // Delete history for all domains in the trash list
  async function trashListedDomains() {
    chrome.storage.local.get([TRASH_LIST_KEY], async function(result) {
      const domains = result[TRASH_LIST_KEY] || [];
      
      if (domains.length === 0) {
        logMessage("No domains in trash list", "error");
        return;
      }
      
      clearLog();
      log.innerHTML = `<div><b>Deleting history for all domains in trash list...</b></div>`;
      
      let totalDeleted = 0;
      
      for (const domain of domains) {
        log.innerHTML += `<div style="margin-top: 10px;"><b>Processing: ${domain}</b></div>`;
        
        let domainTotal = 0;
        let deletedCount = 0;
        let batchCount = 0;
        
        do {
          batchCount++;
          deletedCount = await deleteWithQueryPromise(domain);
          domainTotal += deletedCount;
          
          if (deletedCount > 0) {
            log.innerHTML += `<div>Batch ${batchCount}: Deleted ${deletedCount} items</div>`;
          }
        } while (deletedCount > 0);
        
        totalDeleted += domainTotal;
        log.innerHTML += `<div><b>Total for "${domain}": ${domainTotal} items</b></div>`;
      }
      
      log.innerHTML += `<div style="margin-top: 15px; font-weight: bold;">Complete! Deleted ${totalDeleted} history items across ${domains.length} domains.</div>`;
    });
  }

  // Delete history for a specific query
  function deleteWithQueryPromise(query) {
    return new Promise((resolve, reject) => {
      chrome.history.search({ text: query, startTime, maxResults: 100 }, function (results) {
        results.forEach(function (result) {
          chrome.history.deleteUrl({ url: result.url });
        });
        
        // Resolve with the number of deleted items
        resolve(results.length);
      });
    });
  }

  // Find history matching a query (formerly "dry run")
  function findHistory(query) {
    clearLog();
    
    if (!query) {
      logMessage("Please enter a domain or keyword", "error");
      return;
    }
    
    log.innerHTML = `<div><b>Results for "${query}" (first 100 results):</b></div><br>`;
    
    chrome.history.search({ text: query, startTime, maxResults: 100 }, function (results) {
      if (results.length === 0) {
        log.innerHTML += "<div>No matching history items found.</div>";
        return;
      }
      
      results.forEach(function (result) {
        const date = new Date(result.lastVisitTime).toLocaleString();
        log.innerHTML += `<div style="margin-bottom: 8px;">
          <div>${result.url}</div>
          <div style="font-size: 0.8em; color: #777;">Last visit: ${date}</div>
        </div>`;
      });
      
      log.innerHTML += `<br><div><b>${results.length} items found.</b> Use "Delete" to remove them.</div>`;
    });
  }

  // Delete all history matching a query
  async function deleteHistory(query) {
    clearLog();
    
    if (!query) {
      logMessage("Please enter a domain or keyword", "error");
      return;
    }
    
    log.innerHTML = `<div><b>Deleting history for: "${query}"</b></div>`;
    
    // Delete in a loop until there are no more results
    let totalDeleted = 0;
    let batchCount = 0;
    let deletedCount = 0;
    
    do {
      batchCount++;
      deletedCount = await deleteWithQueryPromise(query);
      totalDeleted += deletedCount;
      
      if (deletedCount > 0) {
        log.innerHTML += `<div>Batch ${batchCount}: Deleted ${deletedCount} items</div>`;
      }
    } while (deletedCount > 0);
    
    log.innerHTML += `<div style="margin-top: 15px; font-weight: bold;">Complete! Deleted ${totalDeleted} history items matching "${query}".</div>`;
  }

  // Utility functions
  function clearLog() {
    log.innerHTML = "";
  }

  function logMessage(message, type = "info") {
    clearLog();
    
    let style = "";
    
    switch (type) {
      case "error":
        style = "color: #ea4335; font-weight: bold;";
        break;
      case "success":
        style = "color: #34a853; font-weight: bold;";
        break;
      case "info":
      default:
        style = "color: #4285f4; font-weight: bold;";
        break;
    }
    
    log.innerHTML = `<div style="${style}">${message}</div>`;
  }
});