import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Input } from "reactstrap";
import { useState } from "react";
import { Book, BookService } from "./sdk/bookService.sdk";

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [userDescription, setUserDescription] = useState<string>("");

  return (
    <div>
      <div>
        Say a fews words about yourself:
        <Input onChange={
          (e) => {
            setUserDescription(e.target.value);
          }
        }>
        </Input>
      </div>
      <button onClick={async () => {
        const books = await BookService.recommendBooksBasedOnDescription(userDescription);
        console.log(books)
        setBooks(books);
      }}>Get books</button>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {books.map((x) => <div>{`${x.title} ${x.publishYear}`}</div>)}
      </div>
    </div>
  );
}
