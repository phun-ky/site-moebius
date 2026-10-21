import { init } from '../';
import App from '../../../app';
import { RouteDetails } from '../types';

export const bootstrap = async (routeDetails: RouteDetails) => {
  await init(App, routeDetails);
};
