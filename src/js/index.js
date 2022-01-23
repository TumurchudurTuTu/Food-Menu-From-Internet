require("@babel/polyfill");
import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from "./view/searchView";
import Recipe from "./model/Recipe";
import List from "./model/List";
import * as listView from "./view/listView";
import Like from "./model/Like";
import * as likesView from "./view/likesView";
import {
  renderRecipe,
  clearRecipe,
  highlightSelectedRecipe,
} from "./view/recipeView";
import { startCase } from "lodash";

const state = {};

/**
 * Хайлтын контроллер = Model ==> Controller <== View
 */
const controlSearch = async () => {
  // 1) Вэбээс хайлтын түлхүүр үгийг гаргаж авна.
  const query = searchView.getInput();

  if (query) {
    // 2) Шинээр хайлтын обьектийг үүсгэж өгнө.
    state.search = new Search(query);

    // 3) Хайлт хийхэд зориулж дэлгэцийг UI бэлтгэнэ.
    searchView.clearSearchQuery();
    searchView.clearSearchResult();
    renderLoader(elements.searchResultDiv);

    // 4) Хайлтыг гүйцэтгэнэ
    await state.search.doSearch();

    // 5) Хайлтын үр дүнг дэлгэцэнд үзүүлнэ.
    clearLoader();
    if (state.search.result === undefined) alert("Хайлтаар илэрцгүй...");
    else searchView.renderRecipes(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.pageButtons.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const gotoPageNumber = parseInt(btn.dataset.goto, 10);
    searchView.clearSearchResult();
    searchView.renderRecipes(state.search.result, gotoPageNumber);
  }
});

/**
 * Жорын контролллер
 */
const controlRecipe = async () => {
  // 1) URL-аас ID-ийг салгаж
  const id = window.location.hash.replace("#", "");

  // URL deer id baigaa esehiig shalgana
  if (id) {
    // 2) Жорын моделийг үүсгэж өгнө.
    state.recipe = new Recipe(id);

    // 3) UI дэлгэцийг бэлтгэнэ.
    clearRecipe();
    renderLoader(elements.recipeDiv);
    highlightSelectedRecipe(id);

    // 4) Жороо татаж авчирна.
    await state.recipe.getRecipe();

    // 5) Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно
    clearLoader();
    state.recipe.calcTime();
    state.recipe.calcHuniiToo();

    // 6) Жороо дэлгэцэнд гаргана
    renderRecipe(state.recipe, state.likes.isLiked(id));
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach((e) =>
  window.addEventListener(e, controlRecipe)
);

window.addEventListener("load", (e) => {
  // shineer like modeliig appiig ehlehed uusgene
  if (!state.likes) state.likes = new Like();
  // Like tsesiig gargah esehiig shiideh
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
  // Like baiwal tedgeeriig tsesend nemj haruulna
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

// Nairlaganii controller

const controlList = () => {
  // Nairlagiin modeliig uusgeh
  state.list = new List();
  // Umnu ni haragdaj baisan nairlaganuudiig delgetsees arilgah
  listView.clearItems();
  // Ug model ruu odoo haragdaj baigaa jornii buh nairlagiig avch hiine
  state.recipe.ingredients.forEach((n) => {
    // Tuhain nairlagiig model ruu hiine
    const item = state.list.addItem(n);
    // Tuhain nairlagiig delgetsend gargana
    listView.renderItem(item);
  });
};

// Like controller
const controlLike = () => {
  // 1. Like-n model-iig uusgene
  // if(state.likes === false) state.likes = new Like();
  if (!state.likes) state.likes = new Like();
  // 2. Odoo haragdaj baigaa joriin ID-g olj avah
  const currentRecipeId = state.recipe.id;
  // 3. Ene joriig like hiisen esehiig shalgah
  if (state.likes.isLiked(currentRecipeId)) {
    // Like hiisen bol like iig boliulna
    state.likes.deleteLike(currentRecipeId);
    // Like-n tsesnees ustgana
    likesView.deleteLike(currentRecipeId);
    // Like hiisen baidliig boliulah
    likesView.toggleLikeBtn(false);
  } else {
    // Like hiigeegui bol like hiine
    const newLike = state.likes.addLike(
      currentRecipeId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.image_url
    );
    // Like tsesend like oruulah
    likesView.renderLike(newLike);
    // Like hiisen baidliig like hiisen bolgoh
    likesView.toggleLikeBtn(true);
  }
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};

elements.recipeDiv.addEventListener("click", (e) => {
  if (e.target.matches(".recipe__btn, .recipe__btn *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});

elements.shoppingList.addEventListener("click", (e) => {
  // click hiisen li elementiin data-itemid attribute-g shuuj gargaj avah
  const id = e.target.closest(".shopping__item").dataset.itemid;
  // Oldson id-tei ortsiig model-oos ustgana
  state.list.deleteItem(id);
  // Delgetsees iim id-tei ortsiig olj ustgana
  listView.deleteItem(id);
});
