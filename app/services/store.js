import Service from "@ember/service";
import { BehaviorSubject } from "rxjs";
import { scan, shareReplay } from "rxjs/operators";
import fuzzysort from "fuzzysort";

export default class StoreService extends Service {
  stores = [];
  async getList() {
    const data = await this.getData();
    const { entry } = data.feed;
    const albums = entry.map((album, index) => {
      const name = album["im:artist"].label;
      const title = album["im:name"].label;
      const thumbnail = album["im:image"][1].label;
      const release = album["im:releaseDate"].attributes.label;
      const price = album["im:price"].label;
      return {
        rank: index + 1,
        name: name,
        title: title,
        thumbnail: thumbnail,
        category: album.category.attributes.term,
        release: release,
        price
      };
    });
    const store = new BehaviorSubject(albums);
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
  searchAlbums(searchTerm) {
    console.log(searchTerm);
    const currentStore = this.stores.find(x => x.modelName == "List");
    const albums = currentStore.store.getValue();
    console.log(albums);
    const results = fuzzysort.go(searchTerm, albums, { key: "name" });
    console.log(results);
  }
}
