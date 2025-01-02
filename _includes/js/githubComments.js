// The actual script will only be ran when the comments element is in view
document.addEventListener('DOMContentLoaded', function() {
  function onIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadComments(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }

  const observer = new IntersectionObserver(onIntersection, {
    root: null, // Use the viewport as the root
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
  });

  var commentsDiv = document.getElementById("comments");
  if (commentsDiv) {
    observer.observe(commentsDiv);
  }
});

// Initially taken from:
// https://retifrav.github.io/blog/2019/04/19/github-comments-hugo/
var loaded = false;
function loadComments(commentsDiv) {
  // Ensures this isn't called multiple times
  if (loaded) {
    console.log("Already loaded comments");
    return;
  }
  loaded = true;

  var id = commentsDiv.getAttribute("gh-issue");
  if (!id) {
    console.error("No GitHub issue ID found");
    return;
  }

  let api_url = "https://api.github.com/repos/marioortizmanero/nullderef.com-comments/issues/".concat(id, "/comments");

  let xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.open("GET", api_url);
  xhr.setRequestHeader("Accept", "application/vnd.github.v3.html+json");
  xhr.send();

  xhr.onload = function() {
    if (xhr.status != 200) {
      return;
    }

    let comments = xhr.response;

    let mainHeader = document.getElementById("comments-header");
    if (comments.length !== 0) {
      mainHeader.innerHTML = "Comments: ".concat(comments.length);
    }

    comments.forEach(function(comment) {
      let creationDate = new Date(comment.created_at);

      let commentContent = document.createElement("div");

      commentContent.setAttribute('class', 'gh-comment')
      commentContent.innerHTML = "".concat(
          "<div class='gh-header'>",
            "<img loading='lazy' alt='avatar of ", comment.user.login ,"' src='", comment.user.avatar_url, "' />",
            "<div style='margin:auto 0;'>",
              "<b><a class='gh-username' href='", comment.user.html_url, "'>", comment.user.login, "</a></b>",
              " commented at <em>", creationDate.toLocaleString(), "</em>",
            "</div>",
          "</div>",
          "<div class='gh-body'>",
            comment.body_html,
          "</div>"
      );
      commentsDiv.appendChild(commentContent);
    });
  };
}
