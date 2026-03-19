import { useState } from "react" // 從 React library 匯入 useState，在 component 裡儲存資料。
import "./App.css" // 載入 App.css 的樣式。

function App(){
    // 搜尋文字
    const [search,setSearch]=useState("") // search：儲存使用者輸入的搜尋文字；setSearch：修改 search 的函式。
    // API 回傳的食物資料
    const [foods,setFoods]=useState([]) // foods：儲存後端回傳的食物資料陣列；setFoods：更新 foods 的函式。
    // 新增食物資料
    const [newFood, setNewFood] = useState({
        food_name: "",
        food_type: "",
        calories: "",
        protein_g: "",
        fat_g: "",
        carbs_g: "",
        fiber_g: "",
        sugar_g: "",
        sodium_mg: "",
        health_score: ""
    });
    // 更新食物
    const [updateId, setUpdateId] = useState(""); // 用來指定要更新 or 刪除的資料
    const [updateFoodData, setUpdateFoodData] = useState({
        food_name: "",
        food_type: "",
        calories: "",
        protein_g: "",
        fat_g: "",
        carbs_g: "",
        fiber_g: "",
        sugar_g: "",
        sodium_mg: "",
        health_score: ""
    });
    const handleEdit = (food) => {
      setMode("update");        // 切換到 update 畫面
      setUpdateId(food.fdc_id);     // 記住這筆資料的 fdc_id，等一下 update 的時候會用到。
      setUpdateFoodData(food);  // 把原本資料填進表單
    };
    const handleDelete = (food) => {
      setMode("delete");        // 切換到 delete 畫面
      setUpdateId(food.fdc_id);     // 記住這筆資料的 fdc_id，等一下 delete 的時候會用到。
    }

    // 控制畫面模式
    const [mode,setMode]=useState(""); // mode：控制目前顯示哪個操作區（add/update/delete）；setMode：修改 mode 的函式。

// 設定 API ####################################################################################//

    // 搜尋：去後端拿資料，等資料回來後轉成 JS 物件，然後更新畫面。
    const searchFood = async () => {
    if (!search) return; // 避免空字串搜尋
    try {
        let res = await fetch(`http://127.0.0.1:5000/food/${encodeURIComponent(search)}`);
        if (!res.ok) throw new Error("Network response was not ok");
        let data = await res.json();
        setFoods(data);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
    };

    // 新增：把 newFood 的資料送到後端，等後端回傳新增的食物資料後，直接把它加到 foods 陣列裡，然後清空表格。
    const addFood = async () => {
      if (!newFood.food_name) {
        alert("Please enter food name");
        return;
      }
      try {
        const res = await fetch(`http://127.0.0.1:5000/food`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newFood)
        });

        if (!res.ok) {
          throw new Error("Failed to add food");
        }

        const addedFood = await res.json();

        alert("Food added!");

        // 直接更新畫面（不用再 search）
        setFoods(prev => [...prev, addedFood]);

        // 清空表格
        setNewFood({
          food_name: "",
          food_type: "",
          calories: "",
          protein_g: "",
          fat_g: "",
          carbs_g: "",
          fiber_g: "",
          sugar_g: "",
          sodium_mg: "",
          health_score: ""
        });

      } catch (err) {
        console.error(err);
        alert("Failed to add food. Check backend.");
      }
    };

    // 更新：把 updateFoodData 的資料送到後端，等後端回傳成功後，根據目前的搜尋條件來決定要不要重新抓資料來刷新畫面。
    const updateFood = async () => {
      if (!updateId) {
        alert("No ID");
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:5000/food/${updateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateFoodData)
        });

        if (!res.ok) throw new Error("Update failed");

        alert("Updated!");

        // 重新抓一次資料來刷新畫面
        if (search) {
          await searchFood(); // 如果有在搜尋模式，就重新搜尋
        } else {
          // 如果沒有搜尋條件，也可以選擇抓全部資料，或手動更新 foods 陣列
          setFoods(prev =>
            prev.map(f => (f.fdc_id === updateId ? { ...updateFoodData, fdc_id: updateId } : f))
          );
        }

        setMode(""); // 關閉 update UI

      } catch (err) {
        console.error(err);
      }
    };

    // 刪除
    const deleteFood = async () => {
        if (!updateId) {
            alert("ID");
            return;
        }

        await fetch(`http://127.0.0.1:5000/food/${updateId}`, {
            method: "DELETE"
        });

        alert("Food deleted!");

        // 刪除後重新抓一次資料來刷新畫面
        if (search) {
            await searchFood(); // 如果有在搜尋模式，就重新搜尋
        } else {
            // 如果沒有搜尋條件，也可以選擇抓全部資料，或手動更新 foods 陣列
            setFoods(prev => prev.filter(f => f.fdc_id !== updateId));
        }

        setMode(""); // 關閉 delete UI
    };

//#############################################################################################//

return(
  // 整個 App 的外層容器，className 會對應到 App.css。
  <div className="App">
    <h2>Food Database</h2>
    <h3>Search Food</h3>
    <input
      value={search}   // input 的值綁定到 state: search。
      onChange={(e)=>setSearch(e.target.value)} // 當使用者輸入文字時，更新 search state。
    />
    <button onClick={searchFood}>Search</button> {/* 按下按鈕會呼叫 searchFood() function。*/}
    <button onClick={()=>setMode("add")}>Add Food</button>

    {/* 只有在 foods 陣列有資料時才顯示表格 */}
    {foods.length > 0 && (
      <table className="add-food-table" border="1">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th>Name</th>
            <th>Type</th>
            <th>Calories</th>
            <th>Protein</th>
            <th>Fat</th>
            <th>Carbs</th>
            <th>Fiber</th>
            <th>Sugar</th>
            <th>Sodium</th>
            <th>Health Score</th>
            <th></th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {foods.map(f => (
            <tr key={f.fdc_id}>
              {/* <td>{f.fdc_id}</td> */}
              <td>{f.food_name}</td>
              <td>{f.food_type}</td>
              <td>{f.calories}</td>
              <td>{f.protein_g}</td>
              <td>{f.fat_g}</td>
              <td>{f.carbs_g}</td>
              <td>{f.fiber_g}</td>
              <td>{f.sugar_g}</td>
              <td>{f.sodium_mg}</td>
              <td>{f.health_score}</td>
              <td><button onClick={() => handleEdit(f)}>Update</button></td>
              <td><button onClick={() => handleDelete(f)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    <hr/>

{/* ====== Add Food 區 =================================================================== */}
    {/* 只有 mode = "add" 才會顯示 */}
    {/* <button onClick={()=>setMode("add")}>Add Food</button> */}
    {mode === "add" && (
      <div>
        {/* <h3>Add Food</h3> */}
        {mode === "add" && (
          <div>
            <h3>Add Food</h3>
            <table className="add-food-table" border="1">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Fat</th>
                  <th>Carbs</th>
                  <th>Fiber</th>
                  <th>Sugar</th>
                  <th>Sodium</th>
                  <th>Health Score</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <input
                      value={newFood.food_name}
                      onChange={(e)=>setNewFood({...newFood, food_name: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.food_type}
                      onChange={(e)=>setNewFood({...newFood, food_type: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.calories}
                      onChange={(e)=>setNewFood({...newFood, calories: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.protein_g}
                      onChange={(e)=>setNewFood({...newFood, protein_g: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.fat_g}
                      onChange={(e)=>setNewFood({...newFood, fat_g: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.carbs_g}
                      onChange={(e)=>setNewFood({...newFood, carbs_g: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.fiber_g}
                      onChange={(e)=>setNewFood({...newFood, fiber_g: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.sugar_g}
                      onChange={(e)=>setNewFood({...newFood, sugar_g: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.sodium_mg}
                      onChange={(e)=>setNewFood({...newFood, sodium_mg: e.target.value})}
                    />
                  </td>

                  <td>
                    <input
                      value={newFood.health_score}
                      onChange={(e)=>setNewFood({...newFood, health_score: e.target.value})}
                    />
                  </td>

                  <td>
                    <button onClick={addFood}>Add</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

{/* ====== Update Food 區 =============================================================== */}
    {/* 只有 mode = "update" 才會顯示 */}
    {mode === "update" && (
    <div>
      <h3>Update Food</h3>

      <table className="add-food-table" border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Calories</th>
            <th>Protein</th>
            <th>Fat</th>
            <th>Carbs</th>
            <th>Fiber</th>
            <th>Sugar</th>
            <th>Sodium</th>
            <th>Health Score</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <input
                value={updateFoodData.food_name}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, food_name: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.food_type}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, food_type: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.calories}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, calories: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.protein_g}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, protein_g: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.fat_g}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, fat_g: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.carbs_g}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, carbs_g: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.fiber_g}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, fiber_g: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.sugar_g}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, sugar_g: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.sodium_mg}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, sodium_mg: e.target.value})}
              />
            </td>

            <td>
              <input
                value={updateFoodData.health_score}
                onChange={(e)=>setUpdateFoodData({...updateFoodData, health_score: e.target.value})}
              />
            </td>

            <td>
              <button onClick={updateFood}>Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )}

{/* ====== Delete Food 區 ================================================================= */}
    {/* 只有 mode = "delete" 才會顯示 */}
    {mode === "delete" && (
      <div>
        <h3>Delete Food</h3>
        <h3>
          Are you sure you want to delete {foods.map(f => f.food_name).join(", ")}?
        </h3>
        {/* 按下按鈕呼叫 deleteFood() */}
        <button onClick={() => setMode("")}>Cancel</button>
        <button onClick={deleteFood}>Delete</button>
        
      </div>
    )}
  </div>
)
}

// 匯出 App component，讓其他檔案可以使用
export default App