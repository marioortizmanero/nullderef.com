import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

export default {
  tags: [
    "posts",
  ],
  layout: "layouts/post.liquid",
  eleventyDataSchema: function(data) {
    let result = z.object({
      title: z.string(),
      description: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      date: z.date(),
      GHissueID: z.number().or(z.undefined()),
      tags: z.array(z.string()).or(z.undefined()),
      keywords: z.array(z.string()).or(z.undefined()),
      draft: z.boolean().or(z.undefined()),
      series: z.string().or(z.undefined()),
      hasMath: z.boolean().or(z.undefined()),
      externalPost: z.string().or(z.undefined()),
      eleventyExcludeFromCollections: z.boolean().or(z.undefined())
    }).safeParse(data);

    if (result.error) {
      throw fromZodError(result.error);
    }
  },
};

