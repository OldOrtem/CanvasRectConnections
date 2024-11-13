import React, { useState } from "react";
import RectForm from "./RectForm"; 

const ToggleFormButton: React.FC = () => {
  // Стейт для контроля видимости формы
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  // Обработчик нажатия на кнопку
  const toggleFormVisibility = () => {
    setIsFormVisible((prevState) => !prevState);
  };

  return (
    <>
    
    <div className="container">
      <button className="toggleButt" onClick={toggleFormVisibility}>
        {isFormVisible ? "Скрыть форму" : "Показать форму"}
      </button>

      {/* Условный рендеринг формы */}
      
    </div>
    {isFormVisible && <RectForm />}
    </>
  );
};

export default ToggleFormButton;
