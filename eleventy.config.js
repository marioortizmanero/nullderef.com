import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import markdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAnchor from "markdown-it-anchor";
import markdownItToc from "markdown-it-table-of-contents";

import pluginFilters from "./_config/filters.js";
import pluginShortcodes from "./_config/shortcodes.js";
import pluginTransforms from "./_config/transforms.js";
import pluginCollections from "./_config/collections.js";
import metadata from "./_data/metadata.js";

export default async function(eleventyConfig) {
  // Drafts, see also _data/eleventyDataSchema.js
  eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  // The `public` directory is passed through to the output directory.
  eleventyConfig
    .addPassthroughCopy({
      "./public/": "/",
      "node_modules/fuse.js/dist/fuse.basic.min.js": "/js/fuse.js"
    })
    .addPassthroughCopy("./content/**/*.{svg,png,jpg,jpeg,webp}") // Images
    .addPassthroughCopy("./content/**/*.{webm,mp4}") // Videos
    .addPassthroughCopy("./content/**/*.{pdf,pptx}") // Documents
    .addPassthroughCopy("./content/**/*.glb") // 3D files
    .addPassthroughCopy("./content/**/*.sh") // Scripts
    // TODO: add XSL to have styling even without RSS plugins
    // .addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");
  // We need to manually watch the images due to the processing pipeline.
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg,avif,webp}");

  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    errorOnInvalidLanguage: true,
  });

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/index.xml",
    // TODO: add XSL
    // stylesheet: "pretty-atom-feed.xsl",
    collection: {
      name: "posts",
      limit: 0,
    },
    metadata: {
      title: metadata.title,
      subtitle: metadata.description,
      language: metadata.language,
      base: metadata.url,
      author: {
        name: metadata.author.name,
        email: metadata.author.email
      }
    }
  });

  // Image optimization:
  // https://www.11ty.dev/docs/plugins/image/#eleventy-transform
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp", "auto"],
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    }
  });

  // Custom plugins
  eleventyConfig.addPlugin(pluginFilters);
  eleventyConfig.addPlugin(pluginShortcodes);
  eleventyConfig.addPlugin(pluginTransforms);
  eleventyConfig.addPlugin(pluginCollections);

  const markdown = markdownIt({
      html: true,  // Embedding raw HTML
      typographer: true,  // Replacing characters like arrows or dashes
      linkify: true,  // Creates <a> for links automatically
    })
    .use(markdownItFootnote)
    .use(markdownItAnchor, {
      slugify: eleventyConfig.getFilter("slugify"),
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: 'after',
      }),
    })
    .use(markdownItToc, {
      includeLevel: [2, 3],
      transformContainerOpen: () => {
          return `<details class="toc">
<summary>Table of Contents</summary>
`;
      },
      transformContainerClose: () => {
          return '</details>';
      }
    });
  markdown.renderer.rules.footnote_block_open = () => {
    return `<h2 id="footnotes">Footnotes</h2>
<ol class="footnotes-list">`;
  };
  markdown.renderer.rules.footnote_block_close = () => {
    return '</ol>';
  };
  eleventyConfig.setLibrary("md", markdown);
};

export const config = {
  templateFormats: [
    "md",
    "html",
    "liquid",
    "json",
    "njk",  // Plugins like RSS need this
  ],

  dir: {
    input: "content",
    includes: "../_includes",
    data: "../_data",
    output: "_site"
  },
};
