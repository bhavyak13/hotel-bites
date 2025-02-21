import React, { useEffect, useState } from "react";
import CardGroup from "react-bootstrap/CardGroup";

import { useFirebase } from "../context/Firebase";
import FoodCard from "../components/FoodCard";

const HomePage = () => {
  const firebase = useFirebase();

  const [data, setData] = useState([]);



  useEffect(() => {
    firebase.fetchProductsWithFirstVariant()
      .then((data) =>
        setData(data)
      );

  }, []);

  console.log("BK data",data);

  return (
    <div className="container mt-5">
      <CardGroup>
        {data?.map((book) => (
          <FoodCard
            key={book.id}
            id={book.id}
            {...book}
          />
        ))}
      </CardGroup>
    </div>
  );
};

export default HomePage;
