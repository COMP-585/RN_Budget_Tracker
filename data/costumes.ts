import { staticCostumes, staticPetCostumes, staticPets } from "./staticAssets";

export type Costume = {
  id: number;
  image_path?: number;
  name: string;
  price: number;
  dog_costume?: number;
  cat_costume?: number;
};

export const costumes: Costume[] = [
  {
    id: 0,
    name: "None",
    price: 0,
    dog_costume: staticPets.dogImg,
    cat_costume: staticPets.catImg,
  },
  {
    id: 1,
    image_path: staticCostumes.cowboyCostume,
    name: "Cowboy",
    price: 50,
    dog_costume: staticPetCostumes.dogCowboy,
    cat_costume: staticPetCostumes.catCowboy,
  },
  {
    id: 2,
    image_path: staticCostumes.pirateCostume,
    name: "Pirate",
    price: 200,
    dog_costume: staticPetCostumes.dogPirate,
    cat_costume: staticPetCostumes.catPirate,
  },
  {
    id: 3,
    image_path: staticCostumes.robotCostume,
    name: "Robot",
    price: 500,
    dog_costume: staticPetCostumes.dogRobot,
    cat_costume: staticPetCostumes.catRobot,
  },
];
