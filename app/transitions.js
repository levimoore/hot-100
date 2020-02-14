export default function() {
  this.transition(
    this.fromRoute("index"),
    this.toRoute("list"),
    this.use("toLeft"),
    this.reverse("toRight")
  );
}
