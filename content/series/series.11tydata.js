import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

export default {
  tags: [
    "series",
  ],
  layout: "layouts/series.liquid",
  eleventyDataSchema: function(data) {
    let result = z.object({
      title: z.string(),
      description: z.string(),  // Markdown is allowed here
      isFinished: z.boolean(),
      keywords: z.array(z.string())
    }).safeParse(data);

    if (result.error) {
      throw fromZodError(result.error);
    }
  },
  eleventyComputed: {
    name: (data) => data.page.url.split("/")[2],
  },
};

