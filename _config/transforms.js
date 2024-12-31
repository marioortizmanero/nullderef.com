import { minify } from "html-minifier-terser";

export default function(eleventyConfig) {
  // Minify HTML only in production
  // if (process.env.NODE_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", async (content, outputPath) => {
      if (outputPath && outputPath.endsWith(".html")) {
        const minified = await minify(content, {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          minifyCSS: true,
          minifyJS: true,
          ignoreCustomFragments: [/<pre[\s\S]*?<\/pre>/g],
        });
        return minified;
      }
      return content;
    });
  // }
};

