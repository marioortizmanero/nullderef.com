/*
  PaperMod v8+
  License: MIT https://github.com/adityatelange/hugo-PaperMod/blob/master/LICENSE
  Copyright (c) 2020 nanxiaobei and adityatelange
  Copyright (c) 2021-2024 adityatelange
*/

let fuse; // holds our search engine
let resultsList;
let searchInput;
let first, last, current_elem = null;
let resultsAvailable = false;

function loadSearchIndex() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
          return
      }
      if (xhr.status !== 200) {
          console.error(xhr.responseText);
          return
      }

      let data = JSON.parse(xhr.responseText);
      if (!data) {
          console.error("Parsing /index.json failed!");
      }

      fuse = new Fuse(data, {
          distance: 100,
          threshold: 0.4,
          ignoreLocation: true,
          keys: [
              'title',
              'permalink',
              'description',
              'content',
              'keywords',
              'tags'
          ]
      });
    };
    xhr.open('GET', "/index.json");
    xhr.send();
}

function renderKeyPressed(e) {
    let key = e.key;
    let ae = document.activeElement;

    let inbox = document.getElementById("searchbox").contains(ae)

    if (ae === searchInput) {
        let elements = document.getElementsByClassName('focus');
        while (elements.length > 0) {
            elements[0].classList.remove('focus');
        }
    } else if (current_elem) ae = current_elem;

    if (key === "Escape") {
        reset()
    } else if (!resultsAvailable || !inbox) {
        return
    } else if (key === "ArrowDown") {
        e.preventDefault();
        if (ae == searchInput) {
            // if the currently focused element is the search input, focus the <a> of first <li>
            activeToggle(resultsList.firstChild.lastChild);
        } else if (ae.parentElement != last) {
            // if the currently focused element's parent is last, do nothing
            // otherwise select the next search result
            activeToggle(ae.parentElement.nextSibling.lastChild);
        }
    } else if (key === "ArrowUp") {
        e.preventDefault();
        if (ae.parentElement == first) {
            // if the currently focused element is first item, go to input box
            activeToggle(searchInput);
        } else if (ae != searchInput) {
            // if the currently focused element is input box, do nothing
            // otherwise select the previous search result
            activeToggle(ae.parentElement.previousSibling.lastChild);
        }
    } else if (key === "ArrowRight") {
        ae.click(); // click on active link
    }
}

function searchOnKeyPressed(e) {
    // run a search query (for "term") every time a letter is typed
    // in the search box
    if (!fuse) {
        return
    }

    let results = fuse.search(this.value.trim()); // the actual query being run using fuse.js
    if (results.length !== 0) {
        // build our html if result exists
        let resultSet = ''; // our results bucket

        for (let item in results) {
            resultSet += `<li class="post-entry"><header class="entry-header">${results[item].item.title}&nbsp;»</header>` +
                `<a href="${results[item].item.permalink}" aria-label="${results[item].item.title}"></a></li>`
        }

        resultsList.innerHTML = resultSet;
        resultsAvailable = true;
        first = resultsList.firstChild;
        last = resultsList.lastChild;
    } else {
        resultsAvailable = false;
        resultsList.innerHTML = '';
    }
}

function activeToggle(ae) {
    document.querySelectorAll('.focus').forEach(function (element) {
        // rm focus class
        element.classList.remove("focus")
    });
    if (ae) {
        ae.focus()
        document.activeElement = current_elem = ae;
        ae.parentElement.classList.add("focus")
    } else {
        document.activeElement.parentElement.classList.add("focus")
    }
}

function reset() {
    resultsAvailable = false;
    resultsList.innerHTML = searchInput.value = ''; // clear inputbox and searchResults
    searchInput.focus(); // shift focus to input box
}


window.onload = function () {
    resultsList = document.getElementById('searchResults');
    searchInput = document.getElementById('searchInput');

    loadSearchIndex();
    document.onkeydown = renderKeyPressed
    searchInput.onkeyup = searchOnKeyPressed
    searchInput.addEventListener('search', function (e) {
        // clicked on x
        if (!this.value) reset()
    });
}
