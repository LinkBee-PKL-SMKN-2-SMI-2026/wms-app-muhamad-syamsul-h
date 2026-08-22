import type { z } from 'zod';
import type {
    CreateInboundSchema,
    CreateOutboundSchema,
    GetMovementHistorySchema,
} from '../validations/stock-movement.validation';


export type CreateInboundDTO = z.infer<typeof CreateInboundSchema>['body'];

export type CreateOutboundDTO = z.infer<typeof CreateOutboundSchema>['body'];

export type GetMovementHistoryDTO = z.infer<typeof GetMovementHistorySchema>['query'];