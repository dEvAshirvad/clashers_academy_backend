import { Request, Response, NextFunction } from 'express';
import useragent from 'express-useragent';

export const deviceInfoMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const source = req.headers['user-agent'] || '';
    const ua = useragent.parse(source);

    req.device = {
        type: ua.isMobile ? 'Mobile' : ua.isTablet ? 'Tablet' : 'Desktop',
        os: `${ua.os}`,   // e.g., "Windows 10", "iOS 14.2"
        browser: `${ua.browser} ${ua.version}` // e.g., "Chrome 90.0"
    };

    next();
};
