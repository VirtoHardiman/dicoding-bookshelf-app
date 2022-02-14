const STORAGE_KEY = "BOOK_APPS";
const BOOK_ITEMID = "itemId";

let bookObjects = [];

function isStorageExist() {
  if (typeof Storage !== undefined) {
    return true;
  }
  alert("Your browser is not supported by local storage");
  return false;
}

function saveData() {
  const parsed = JSON.stringify(bookObjects);
  localStorage.setItem(STORAGE_KEY, parsed);
  document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
  const stringData = localStorage.getItem(STORAGE_KEY);

  let objectData = JSON.parse(stringData);

  if (objectData !== null) {
    bookObjects = objectData;
  }

  document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
  if (isStorageExist()) {
    saveData();
  }
}

function composeBookObject(title, author, year, genreValue, isComplete) {
  return {
    id: new Date().getTime(),
    title,
    author,
    year,
    isComplete,
    genreValue,
  };
}

function findBook(bookId) {
  for (bookObject of bookObjects) {
    if (bookObject.id === bookId) {
      return bookObject;
    }
  }

  return null;
}

function findBookIndex(bookId) {
  bookObjects.forEach((bookObject) => {
    if (bookObject.id === bookId) {
      return bookId;
    }
  });
  return -1;
}

function setWebsiteBottomPart() {
  const totalInProgressBooks = document.querySelectorAll(".in-progress-books .book").length;
  const totalCompletedBooks = document.querySelectorAll(".completed-books .book").length;

  let container = 355;

  let bg = 992;
  let inProgressMax = 0;
  let completedMax = 0;

  if (totalInProgressBooks > 5 || totalCompletedBooks > 5) {
    let remainingInProgress = totalInProgressBooks % 5;
    let remainingCompleted = totalCompletedBooks % 5;
    let totalInProgress = totalInProgressBooks - remainingInProgress;
    let totalCompleted = totalCompletedBooks - remainingCompleted;

    for (i = totalInProgress; i > 0; i -= 5) {
      inProgressMax += 330;
    }

    for (i = totalCompleted; i > 0; i -= 5) {
      completedMax += 330;
    }

    if (inProgressMax >= completedMax) {
      bg += inProgressMax;
      container += inProgressMax;
    } else {
      bg += completedMax;
      container += completedMax;
    }
  }
  document.querySelector(".bottom").style.height = `${bg}px`;
  document.querySelector(".in-progress-books").style.height = `${container}px`;
  document.querySelector(".completed-books").style.height = `${container}px`;
  document.querySelector("footer").style.top = `${bg}px`;
}

function populateBookElement() {
  for (bookObject of bookObjects) {
    const existingBook = createBook(bookObject.title, bookObject.author, bookObject.year, bookObject.genreValue, bookObject.isComplete);
    existingBook[BOOK_ITEMID] = bookObject.id;

    if (bookObject.isComplete) {
      document.querySelector(".completed-books").append(existingBook);
    } else {
      document.querySelector(".in-progress-books").append(existingBook);
    }
  }

  setWebsiteBottomPart();
}
