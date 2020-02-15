import Service from "@ember/service";
import { BehaviorSubject } from "rxjs";
import { scan, shareReplay } from "rxjs/operators";
import fuzzysort from "fuzzysort";

export default class StoreService extends Service {
  stores = [];
  async getList() {
    const data = await this.getData();
    const albums = this.normalizeData(data);
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
  normalizeData(data) {
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
    return albums;
  }

  searchAlbums(searchTerm) {
    const currentStore = this.stores.find(x => x.modelName == "List");
    const albums = currentStore.store.getValue();
    const results = fuzzysort.go(searchTerm, albums, {
      keys: ["name", "title", "category"]
    });
    let searchResults = [];
    results.forEach(album => {
      searchResults.push(album.obj);
    });
    currentStore.store.next(searchResults);
  }

  async resetStore(filter) {
    const data = await this.getData();
    const albums = this.normalizeData(data);
    const currentStore = this.stores.find(x => x.modelName == "List");
    if (filter) {
      const results = fuzzysort.go(filter, albums, {
        keys: ["name", "title", "category"]
      });
      let searchResults = [];
      results.forEach(album => {
        searchResults.push(album.obj);
      });
      searchResults.sort((first, second) => {
        if (first.rank < second.rank) {
          return -1;
        }
        return 1;
      });
      currentStore.store.next(searchResults);
    } else {
      currentStore.store.next(albums);
    }
  }
}
