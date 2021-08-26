import { RequestHandler } from 'express';
import ms from 'ms';
import { RateLimiterMemcache, RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import env from '../env';
import { HitRateLimitException } from '../exceptions';
import { createRateLimiter } from '../rate-limiter';
import asyncHandler from '../utils/async-handler';
import { validateEnv } from '../utils/validate-env';

let checkRateLimit: RequestHandler = (req, res, next) => next();
export let rateLimiter: RateLimiterRedis | RateLimiterMemcache | RateLimiterMemory;

if (env.RATE_LIMITER_ENABLED === true) {
	validateEnv(['RATE_LIMITER_STORE', 'RATE_LIMITER_DURATION', 'RATE_LIMITER_POINTS']);

	rateLimiter = createRateLimiter();

	checkRateLimit = asyncHandler(async (req, res, next) => {
		try {
			await rateLimiter.consume(req.ip, 1);
		} catch (rateLimiterRes) {
			if (rateLimiterRes instanceof Error) throw rateLimiterRes;

			res.set('Retry-After', String(rateLimiterRes.msBeforeNext / 1000));
			throw new HitRateLimitException(`Too many requests, retry after ${ms(rateLimiterRes.msBeforeNext)}.`, {
				limit: +env.RATE_LIMITER_POINTS,
				reset: new Date(Date.now() + rateLimiterRes.msBeforeNext),
			});
		}

		next();
	});
}

export default checkRateLimit;
