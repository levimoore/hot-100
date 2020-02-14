import Service from "@ember/service";
import { BehaviorSubject } from "rxjs";
import { scan, shareReplay } from "rxjs/operators";

export default class StoreService extends Service {
  stores = [];
  async getList() {
    const data = await this.getData();
    const { entry } = data.feed;
    const store = new BehaviorSubject(entry);
    this.stores.push({ modelName: "List", store: store });
    const state$ = store.asObservable().pipe(
      scan((acc, newVal) => {
        return { ...acc, newVal };
      }),
      shareReplay(1)
    );
    return state$;
  }

  async getData() {
    return fetch("https://itunes.apple.com/us/rss/topalbums/limit=100/json", {
      method: "GET"
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        return data;
      })
      .catch(e => console.log("error", e));
  }
}
