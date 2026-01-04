import { z } from 'zod';
import { insertUserSchema, insertExperienceSchema, insertEducationSchema, users, experience, education } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile',
      responses: {
        200: z.object({
          user: z.custom<typeof users.$inferSelect>(),
          experience: z.array(z.custom<typeof experience.$inferSelect>()),
          education: z.array(z.custom<typeof education.$inferSelect>()),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profile',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  upload: {
    resume: {
      method: 'POST' as const,
      path: '/api/upload_resume',
      // Multipart form data, schema check is tricky here, but we'll assume formData
      responses: {
        200: z.object({
          message: z.string(),
          profile: z.object({
             user: z.custom<typeof users.$inferSelect>(),
             experience: z.array(z.custom<typeof experience.$inferSelect>()),
             education: z.array(z.custom<typeof education.$inferSelect>()),
          })
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal,
      },
    },
  },
  experience: {
    create: {
      method: 'POST' as const,
      path: '/api/experience',
      input: insertExperienceSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof experience.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/experience/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  education: {
    create: {
      method: 'POST' as const,
      path: '/api/education',
      input: insertEducationSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof education.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/education/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
