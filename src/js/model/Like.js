export default class Likes {
  constructor() {
    this.readDataFromLocalStorage();
    if (!this.likes) this.likes = [];
  }

  addLike(id, title, publisher, img) {
    const like = { id, title, publisher, img };
    this.likes.push(like);
    // storage ruu hadgalana
    this.saveDataToLocalStorage();
    return like;
  }

  deleteLike(id) {
    // id gedeg ID-tei like-g index-g massive aas haij olno
    const index = this.likes.findIndex((el) => el.id === id);
    // Ug index deerh elementiig massivaas ustgana
    this.likes.splice(index, 1);
    // storage ruu hadgalana
    this.saveDataToLocalStorage();
  }

  isLiked(id) {
    //    if(this.likes.findIndex(el => el.id === id) === -1) return false;
    //    else return true;
    return this.likes.findIndex((el) => el.id === id) !== -1;
  }

  getNumberOfLikes() {
    return this.likes.length;
  }

  saveDataToLocalStorage() {
    // massive iin buh utguudiig zadlaad json bolgoh
    localStorage.setItem("likes", JSON.stringify(this.likes));
  }

  readDataFromLocalStorage() {
    // JSON string oos javascript object bolgoh
    this.likes = JSON.parse(localStorage.getItem("likes"));
  }
}
