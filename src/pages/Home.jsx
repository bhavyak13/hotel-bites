import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/Card";

const HomePage = () => {
  const firebase = useFirebase();
  const [data, setData] = useState([]);

  useEffect(() => {
    firebase.getDocuments()
      .then((data) =>
        setData(data.docs)
      );
  }, []);

  return (
    <div className="container mt-5">
      <CardGroup>
        {data?.map((book) => (
          <FoodCard
            link={`/book/view/${book.id}`}
            key={book.id}
            id={book.id}
            {...book.data()}
          />
        ))}
      </CardGroup>
    </div>
  );
};

export default HomePage;
