import MarkdownIt from "markdown-it";

const markdownIt = new MarkdownIt();

// TODO: use `render` instead of `include`, and remove the extension for simplicity

// Icons taken from https://github.com/primer/octicons
const GH_ICON_ISSUE = '<svg class="gh-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/><path fill-rule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/></svg>';
const GH_ICON_PR = '<svg class="gh-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/></svg>'
const GH_ICON_COMMENT = '<svg class="gh-icon" width="16" height="16" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <defs /> <path d="M 3.25,15 C 1.4550746,15 0,13.544925 0,11.75 V 3.25 C 0,1.4550746 1.4550746,0 3.25,0 h 13.5 C 18.544925,0 20,1.4550746 20,3.25 v 8.5 C 20,13.544925 18.544925,15 16.75,15 H 11.012485 L 5.9986815,18.750679 C 5.4458514,19.164165 4.6624979,19.051204 4.2490125,18.498373 4.0873576,18.282241 4,18.019591 4,17.749906 L 3.9992143,15 Z m 7.263515,-1.5 H 16.75 c 0.966498,0 1.75,-0.783502 1.75,-1.75 V 3.25 C 18.5,2.2835017 17.716498,1.5 16.75,1.5 H 3.25 C 2.2835017,1.5 1.5,2.2835017 1.5,3.25 v 8.5 c 0,0.966498 0.7835017,1.75 1.75,1.75 H 5.4987857 L 5.499,14.249786 5.4998574,17.25057 Z" /> </svg>'

export default function(eleventyConfig) {
  eleventyConfig.addShortcode("crate", function(crate) {
    return `<a href="https://crates.io/crates/${crate}"><code>${crate}</code></a>`
  });

  eleventyConfig.addShortcode("gh", function(type, repo, reference, title) {
    let url_type = "";
    let icon = "";
    let comment = "";

    if (type === "issue") {
      url_type = "issues";
      icon = GH_ICON_ISSUE;
    } else if (type === "issue-comment") {
      url_type = "issues";
      icon = GH_ICON_COMMENT;
      comment = " <i>(comment)</i>";
    } else if (type === "pr") {
      url_type = "pull";
      icon = GH_ICON_PR;
    } else if (type === "pr-comment") {
      url_type = "pull";
      icon = GH_ICON_COMMENT;
      comment = " <i>(comment)</i>";
    } else {
      throw new Error(`Invalid type (expected issue, issue-comment, pr, pr-comment): ${type}`);
    }

    let titleHtml = markdownIt.renderInline(title);

    return `<span class="gh-reference">${icon}<a class="gh-title" href="https://github.com/${repo}/${url_type}/${reference}" style="text-decoration: none;">${titleHtml}<span class="gh-number">${repo}#${reference}${comment}</span></a></span>`
  });
};
