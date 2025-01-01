import { minify } from "html-minifier-terser";
import * as cheerio from 'cheerio';

export default function(eleventyConfig) {
  // `text` code blocks won't have their HTML escaped, which can result in
  // weird edge cases:
  //   https://github.com/11ty/eleventy-plugin-syntaxhighlight/blob/7b7b547fff07f2e60d91c0a7ed3bba1938dbc057/src/markdownSyntaxHighlightOptions.js#L20-L24
  eleventyConfig.addTransform("forbidTextInCode", function(content) {
    if (this.outputPath && this.outputPath.endsWith(".html")) {
      const $ = cheerio.load(content);
      if ($('pre.language-text').length > 0) {
        throw new Error('Use "plain" instead of "text" in code blocks');
      }
    }

    return content;
  });

  eleventyConfig.addTransform("htmlmin", async (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    const minified = await minify(content, {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      ignoreCustomFragments: [
        // The minifier breaks with Rust lifetimes such as <'a>.
        //
        // See https://github.com/terser/html-minifier-terser/issues/161
        /<code[\s\S]*?>[\s\S]*?<\/code>/g,
        // Markdown rendering results in HTML such as:
        //   <a href="...">hey</a> there
        // This should read "hey there" but it's incorrectly minified, resulting
        // in "heythere". We could add a margin, but plainifying might break.
        //
        // See http://perfectionkills.com/experimenting-with-html-minifier/#collapse_whitespace
        /<p>[\s\S]*?<\/p>/g
      ],
    });
    return minified;
  });
};

