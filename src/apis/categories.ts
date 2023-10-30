import { ICategory } from "../interfaces/Category";
import { axiosClient } from "../libraries/axiosClient";

export async function getAllCategories() {
  try {
    const response = await axiosClient.get("/categories");
    const categories = response.data.filter((category: ICategory) => {
      return category.is_delete === false;
    });
    return categories;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch categories");
  }
  // axiosClient
  //   .get("/categories")
  //   .then((response) => {
  //     const filteredCategories = response.data.filter((category: ICategory) => {
  //       return category.is_delete === false;
  //     });
  //     setCategories(filteredCategories);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
}
