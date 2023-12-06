import { router } from '../router';
import { bootstrap } from './bootstrap';

export const popstate = async (e) => {
  const routeDetails = router();

  await bootstrap(routeDetails);
};
