import proxy from 'express-http-proxy';

export const proxyWithHeader = (target) => {
    return proxy(target, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            if (srcReq.user) {
                proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
                proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
                proxyReqOpts.headers['x-user-plan'] = srcReq.user.plan;
            }
            return proxyReqOpts;
        }
    });
};
