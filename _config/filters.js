import MarkdownIt from "markdown-it";
import fs from "fs";
import * as cheerio from 'cheerio';

import metadata from "../_data/metadata.js";

const markdownIt = new MarkdownIt();

export default function(eleventyConfig) {
	eleventyConfig.addFilter("absUrl", (relUrl) => {
    return new URL(relUrl, metadata.url).href;
  });

	eleventyConfig.addFilter("readableDateShort", (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
    }).format(date);
	});

	eleventyConfig.addFilter("readableDateLong", (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
	});

	eleventyConfig.addFilter("iso8601Date", (dateString) => {
    const date = new Date(dateString);
    return date.toISOString();
	});

  eleventyConfig.addFilter("lastModified", (filePath) => {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  });

	eleventyConfig.addFilter("getTags", (tags) => {
		return Object.keys(tags)
      .filter(tag => !["all", "posts", "series"].includes(tag))
      .map(tag => ({ name: tag, count: tags[tag].length }))
      .toSorted((a, b) => b.count - a.count);
	});

	eleventyConfig.addFilter("getTagsInPost", (tags) => {
		return tags.filter(tag => tag !== "posts");
	});

	eleventyConfig.addFilter("getSeries", (series, name) => {
    return series.find(s => s.data.name === name);
	});

	eleventyConfig.addFilter("getPostsInSeries", (posts, seriesName) => {
    return posts.filter(s => s.data.series === seriesName);
	});

  eleventyConfig.addFilter("recentPosts", function (posts) {
    return posts.reverse().filter(p => p.url !== this.page.url).slice(0, 5);
  });

	eleventyConfig.addFilter("assertLengthUnder", (str, maxLength) => {
    if (typeof str !== "string" || !Number.isInteger(maxLength)) {
      throw new Error("assertLengthUnder filter expects a string and integer");
    }
    if (str.length > maxLength) {
      throw new Error(`String has length of ${str.length}, which is above the expected maximum of ${maxLength}: ${str}`);
    }
    return str;
	});

	eleventyConfig.addFilter("raiseError", (str) => {
    throw new Error(`Validation failed in a template: ${str}`);
  });

	eleventyConfig.addFilter("markdownify", (str) => {
    return markdownIt.renderInline(str);
  });

	eleventyConfig.addFilter("strip_whitespace", (str) => {
    return str.replace(/[\r\n\t]/g, ' ').trim();
  });

  // Better than `strip_html` because it also removes unnecessary elements and
  // trims the whitespace.
  eleventyConfig.addFilter("plainifyHtml", (html) => {
    const $ = cheerio.load(html);
    // The table of contents is a Markdown plugin, so it's actually part of the
    // content.
    $(".toc").remove();
    // https://github.com/cheeriojs/cheerio/issues/339
    $("style").remove();
    const plain = $.text();
    return plain.replace(/[\r\n\t]/g, ' ').trim();
  });

	eleventyConfig.addFilter("log", (obj) => {
    console.log(obj);
    console.log("------------------------");
  });
};
