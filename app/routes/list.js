import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

export default class ListRoute extends Route {
  @service store;
  async model() {
    const data = await this.store.getList();
    return data;
  }
  setupController(controller, model) {
    super.setupController(controller, model);
    model.subscribe({
      next: event => {
        if (event.newVal)
          return this.controllerFor("list").set("model", event.newVal);
        return this.controllerFor("list").set("model", event);
      }
    });
  }
}
