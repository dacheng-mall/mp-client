import { getFavorites } from "../../utils/tools";
exports.process = function(data = []) {
  return getFavorites().then(myFavorites => {
    if (myFavorites) {
      return data.map(d => {
        if (myFavorites.includes(d.id)) {
          return { ...d, favorite: true };
        }
        return d;
      });
    }
    return data;
  });
};
