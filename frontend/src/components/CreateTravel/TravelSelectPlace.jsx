// src/components/CreateTravel/TravelSelectPlace.jsx
import React, { useState, useEffect, memo } from "react";
import PlaceMap from "../StandardCreatePage/PlaceMap";
import "./TravelSelectPlace.css";

import LocationIcon from "../../icons/LocationIcon";
import { ReactComponent as BackIcon } from "../../assets/prev_arrow.svg";
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as SearchIcon } from "../../assets/Search.svg";
import x_circle from "../../assets/x_circle.svg";
import { api } from "../../api/client";

// Map Google's place types to our categories
const mapGoogleTypesToCategories = (types) => {
  const lower = (types || []).map((t) => String(t || "").toLowerCase());

  const accommodation = ["lodging", "hotel", "hostel", "motel", "resort"];
  if (lower.some((t) => accommodation.includes(t))) return "accommodation";

  const restaurant = ["restaurant", "cafe", "bar", "bakery", "meal_takeaway", "food"];
  if (lower.some((t) => restaurant.includes(t))) return "restaurant";

  const place = [
    "tourist_attraction",
    "museum",
    "art_gallery",
    "park",
    "landmark",
    "zoo",
    "aquarium",
    "amusement_park",
    "shopping_mall",
    "store",
  ];
  if (lower.some((t) => place.includes(t))) return "place";

  return "place";
};

const TravelSelectPlace = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [hoveredPlace, setHoveredPlace] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPlaces, setSelectedPlaces] = useState(formData.places || []);
  const [showSaved, setShowSaved] = useState(false);
  const [savingIds, setSavingIds] = useState(() => new Set());

  useEffect(() => {
    if (!submittedSearchTerm) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (window.google?.maps?.places) {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      const request = {
        query: submittedSearchTerm,
        fields: ["place_id", "name", "formatted_address", "geometry", "types"],
        locationBias: {
          center: new window.google.maps.LatLng(37.5665, 126.978),
          radius: 50000,
        },
      };

      service.textSearch(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          const formatted = results.map((r) => ({
            id: r.place_id,
            name: r.name,
            address: r.formatted_address,
            lat: r.geometry.location.lat(),
            lng: r.geometry.location.lng(),
            description: "",
            category: mapGoogleTypesToCategories(r.types),
          }));
          setSearchResults(formatted);
        } else {
          setSearchResults([]);
          setError("No results found. Please try a different search.");
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setError("Google Places is not loaded.");
    }
  }, [submittedSearchTerm]);

  const handleSearch = () => {
    setSubmittedSearchTerm(searchTerm.trim());
    setHoveredPlace(null);
    setShowSaved(false);
  };

  const handleSelectPlace = async (place) => {
    const projectId = formData.projectId;
    const categoryName = place.category || "place";

    if (!projectId) {
      console.warn("No projectId; aborting wishlist add.");
      return;
    }

    // prevent double-click spamming this place
    if (savingIds.has(place.id)) return;

    // optimistic add (no duplicates)
    setSelectedPlaces((prev) =>
      prev.some((p) => p.id === place.id) ? prev : [...prev, place]
    );
    setHoveredPlace(place);
    setSavingIds((s) => new Set(s).add(place.id));
try {
  const url = `/api/travel/${encodeURIComponent(projectId)}/wishlist/${encodeURIComponent(categoryName)}`;
  const payload = {
    name: place.name,
    address: place.address,
    latitude: place.lat,
    longitude: place.lng,
    memo: place.description || "",
    cost: 0,
  };

  // Helpful debug logs
  console.log("[Travel] POST →", url);
  console.log("[Travel] payload →", payload);

  const res = await api.postSession(url, payload);

  console.debug("[Travel] response ←", res);
} catch (e) {
  // If your api client attaches status/body, this will show up here
  console.error("[Travel] POST failed", {
    error: e,
    status: e?.status,
    body: e?.body,
  });
}

//     try {
//       // IMPORTANT: leading slash + /api/travel/project/... matches your controller base
//       await api.post(
//         `/api/travel/${projectId}/wishlist/${categoryName}`,
//         {
//           name: place.name,
//           address: place.address,
//           latitude: place.lat,
//           longitude: place.lng,
//           memo: place.description || "",
//           cost: 0,
//         }
//       );

//       // If server returns a new id, you can merge it into local state here
//       // by reloading or by updating the matching place with _serverId, etc.
//       // (Left out because response contract wasn’t provided.)
//     } catch (e) {
//       // rollback on failure
//       setSelectedPlaces((prev) => prev.filter((p) => p.id !== place.id));
//       console.error("Error selecting place:", e);
//       alert(e?.message || "장소 추가에 실패했습니다.");
//     } finally {
//       setSavingIds((s) => {
//         const next = new Set(s);
//         next.delete(place.id);
//         return next;
//       });
//     }
  };

  const handleUnselectPlace = (placeId) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== placeId));
    // If/when a DELETE endpoint exists, call it here using the server id.
    // await api.deleteSession(`/api/travel/project/${projectId}/wishlist/${serverId}`)
  };

  const handleNext = () => {
    updateFormData({ places: selectedPlaces });
    nextStep();
  };

  const filteredSearchPlaces = searchResults.filter((place) => {
    const matches = activeTab === "all" || place.category === activeTab;
    return matches;
  });

  const filteredSavedPlaces = selectedPlaces.filter((place) => {
    const matches = activeTab === "all" || place.category === activeTab;
    return matches;
  });

  const placesToDisplay = showSaved ? filteredSavedPlaces : filteredSearchPlaces;

  return (
    <div className="travel-choose-place-container">
      <div className="travel-choose-title">
        <button onClick={prevStep} className="prev-button">
          <BackIcon />
        </button>
        <h2>{formData.title}</h2>
      </div>

      <div className="travel-choose-content">
        <div className="travel-map-section" style={{ height: "600px" }}>
          <PlaceMap
            selectedPlace={hoveredPlace}
            selectedPlaces={selectedPlaces}
            places={placesToDisplay}
          />
        </div>

        <div className="travel-choose-search-panel">
          <div className="tab category-tabs toggle-buttons-container">
            <button
              className={`toggle-button ${!showSaved ? "active" : ""}`}
              onClick={() => setShowSaved(false)}
              disabled={!showSaved}
            >
              Search
            </button>
            <button
              className={`toggle-button ${showSaved ? "active" : ""}`}
              onClick={() => setShowSaved(true)}
              disabled={showSaved}
            >
              Saved ({selectedPlaces.length})
            </button>
          </div>

          <div className="tab category-tabs">
            {["all", "place", "restaurant", "accommodation"].map((tab) => (
              <button
                key={tab}
                className={`category-tab ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setHoveredPlace(null);
                }}
                disabled={activeTab === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="travel-choose-search-bar-and-toggle">
            <div className="travel-choose-search-bar">
              <input
                type="text"
                placeholder="searching place..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button
                className="travel-choose-search-button"
                onClick={handleSearch}
              >
                <SearchIcon />
              </button>
            </div>
          </div>

          <ul className="travel-place-list">
            {isLoading && !showSaved && <p>Searching for places...</p>}
            {error && !showSaved && <p className="error-message">{error}</p>}
            {!isLoading && placesToDisplay.length === 0 && (
              <p>
                {showSaved
                  ? "You have no saved places in this category."
                  : "No places found. Try a different search term."}
              </p>
            )}

            {!isLoading &&
              placesToDisplay.map((place) => {
                const isSelected = selectedPlaces.some((p) => p.id === place.id);
                const isSaving = savingIds.has(place.id);
                return (
                  <li
                    key={place.id}
                    className={`travel-place-item ${
                      isSelected ? "selected" : "not-selected"
                    }`}
                    onClick={() => handleSelectPlace(place)}
                    onMouseEnter={() => setHoveredPlace(place)}
                    onMouseLeave={() => setHoveredPlace(null)}
                  >
                    <div className="travel-place-title">
                      <LocationIcon
                        color={isSelected ? "#081F5C" : "#BAD6EB"}
                      />
                      <span>
                        {place.name}
                        {isSaving ? " (saving…)" : ""}
                      </span>
                      {isSelected && (
                        <button
                          className="travel-remove-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnselectPlace(place.id);
                          }}
                          title="Remove from saved"
                        >
                          <img src={x_circle} alt="remove" />
                        </button>
                      )}
                    </div>
                    <div className="travel-place-address">{place.address}</div>
                    <div className="travel-place-desc" style={{ color: "#EEF1F6" }}>
                      {place.description || "description about the place......"}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

      <button className="project2-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default TravelSelectPlace;
