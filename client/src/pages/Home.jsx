import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import RecipeCard from "../components/RecipeCard";
export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);