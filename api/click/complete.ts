import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../click';

export default async function completeHandler(req: VercelRequest, res: VercelResponse) {
  if (req.body && typeof req.body === 'object') {
    req.body.action = 1;
  }
  return handler(req, res);
}
