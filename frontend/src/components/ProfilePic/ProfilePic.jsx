import React from "react";
import styles from "./ProfilePic.css";

var stringToColor = (string, saturation = 60, lightness = 65) => {
  if (!string) string = "User";
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
};


const ProfilePic = (props) =>{
     const fallbackColor = stringToColor(props.name || "User");
    const initials = props.name
    .trim()
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(); 
    const showFallback = !props.image;
    return(
        <div
        className={`${styles.avatar} ${props.className ||""}`}
        style= {{
         backgroundImage: props.image ? `url(${props.image})` : "none",
        backgroundColor: !props.image ? fallbackColor : "transparent"
        }}
        >
        {showFallback && (
        <span className={styles.initials}>{initials}</span>
      )}
        </div>
    );
};

ProfilePic.defaultProps = {
    name:"User",
    image: "",
    className:"avatar"
    
};



export default ProfilePic;