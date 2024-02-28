import { AppConstructorService } from "./services/AppConstructorService";

const app = new AppConstructorService().getConfiguredApp();
export default app;
