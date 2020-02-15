import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class NavigationComponent extends Component {
  @service store;
  @tracked searchTerm;

  @action
  searchForAlbum(event) {
    this.searchTerm = event.target.value;
    this.store.searchAlbums(this.searchTerm);
    console.log(this.searchTerm);
  }
}
