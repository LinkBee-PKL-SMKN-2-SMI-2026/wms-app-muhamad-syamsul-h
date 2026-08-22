import { z } from 'zod';

//(INBOUND)
export const CreateInboundSchema = z.object({
  body: z.object({
    productId: z.string().uuid({ message: 'Product ID harus berupa UUID yang valid' }),
    quantity: z
      .number()
      .int()
      .positive({ message: 'Quantity harus berupa angka bulat dan lebih dari 0' }),
    notes: z.string().optional(),
  }),
});

// (OUTBOUND)
export const CreateOutboundSchema = z.object({
  body: z.object({
    productId: z.string().uuid({ message: 'Product ID harus berupa UUID yang valid' }),
    quantity: z
      .number()
      .int()
      .positive({ message: 'Quantity harus berupa angka bulat dan lebih dari 0' }),
    notes: z.string().optional(),
  }),
});

// (History)
export const GetMovementHistorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    productId: z.string().uuid({ message: 'Product ID harus berupa UUID yang valid' }).optional(),
    type: z.enum(['INBOUND', 'OUTBOUND']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
