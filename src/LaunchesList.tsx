import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

type Launch = {
  flight_number: number;
  mission_name: string;
  launch_year: string;
  launch_success: boolean | null;
  details: string | null;
  links: {
    mission_patch: string | null;
    article_link: string | null;
    video_link: string | null;
  };
  upcoming: boolean;
  launch_date_utc: string;
};

function SpaceXLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [filteredLaunches, setFilteredLaunches] = useState<Launch[]>([]);
  const [search, setSearch] = useState("");
  const [expandedLaunch, setExpandedLaunch] = useState<number | null>(null);
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failure" | "upcoming">("all");
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchBackgroundImages = async () => {
    try {
      const response = await axios.get(
        `https://api.nasa.gov/planetary/apod?count=5&api_key=rAH727r2zWExCJSOKkYx98Y0sC03KwP9PNC0jhwy`
      );
      const urls = response.data.map((item: any) => item.url);
      setBackgroundImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Failed to fetch NASA APOD images");
    }
  };

  useEffect(() => {
    fetchBackgroundImages();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchBackgroundImages();
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchLaunches = async () => {
      const response = await axios.get<Launch[]>("https://api.spacexdata.com/v3/launches");
      const uniqueLaunches = Array.from(
        new Map(response.data.map((item) => [item.flight_number, item])).values()
      );
      setLaunches(uniqueLaunches);
      setFilteredLaunches(uniqueLaunches);
    };
    fetchLaunches();
  }, []);

  useEffect(() => {
    const filtered = launches
      .filter((launch) => {
        if (statusFilter === "success") return launch.launch_success === true;
        if (statusFilter === "failure") return launch.launch_success === false;
        if (statusFilter === "upcoming") return launch.upcoming === true;
        return true;
      })
      .filter((launch) => launch.mission_name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sortOrder === "asc"
          ? new Date(a.launch_date_utc).getTime() - new Date(b.launch_date_utc).getTime()
          : new Date(b.launch_date_utc).getTime() - new Date(a.launch_date_utc).getTime()
      );
    setFilteredLaunches(filtered);
  }, [search, sortOrder, statusFilter, launches]);

  const toggleLaunchDetails = (flightNumber: number) => {
    setExpandedLaunch((prev) => (prev === flightNumber ? null : flightNumber));
  };

  const getStatusBadge = (launch: Launch) => {
    if (launch.upcoming) return <span className="bg-blue-500 text-white px-2 py-1 rounded">Upcoming</span>;
    return launch.launch_success ? (
      <span className="bg-green-500 text-white px-2 py-1 rounded">Success</span>
    ) : (
      <span className="bg-red-500 text-white px-2 py-1 rounded">Failed</span>
    );
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-full z-0 flex flex-wrap">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className="w-full h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        ))}
        <div ref={loaderRef} className="w-full h-1 bg-transparent"></div>
      </div>
      <header className="sticky top-0 bg-blue-500 bg-opacity-50 text-center py-4 z-10 backdrop-blur-sm">
        <h1 className="text-2xl font-bold">SpaceX Launches</h1>
      </header>
      <div className="relative z-10 w-full max-w-2xl mx-auto p-4">
        <div className="mb-4 flex items-center justify-between space-x-4">
          <input
            type="text"
            placeholder="Search launches..."
            className="p-2 flex-grow border border-gray-400 rounded bg-gray-900 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
            onClick={toggleSortOrder}
          >
            Sort by Year: {sortOrder === "asc" ? "Oldest to Newest" : "Newest to Oldest"}
          </button>
        </div>
        <div className="mb-4 flex space-x-4 justify-center">
          {["all", "success", "failure", "upcoming"].map((status) => (
            <label key={status} className="flex items-center space-x-1">
              <input
                type="radio"
                name="statusFilter"
                value={status}
                checked={statusFilter === status}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="form-radio text-blue-500"
              />
              <span className="capitalize text-white">{status}</span>
            </label>
          ))}
        </div>
        <div className="space-y-4">
          {filteredLaunches.map((launch) => (
            <div
              key={launch.flight_number}
              className="bg-gray-800 bg-opacity-90 p-3 rounded shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold">
                    {launch.mission_name} <span className="text-gray-400">({launch.launch_year})</span>
                  </h2>
                  {getStatusBadge(launch)}
                </div>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => toggleLaunchDetails(launch.flight_number)}
                >
                  {expandedLaunch === launch.flight_number ? "HIDE" : "VIEW"}
                </button>
              </div>
              {expandedLaunch === launch.flight_number && (
                <div className="mt-2">
                  <p className="text-gray-200">{launch.details || "No details available."}</p>
                  {launch.links.mission_patch && (
                    <img
                      src={launch.links.mission_patch}
                      alt={`${launch.mission_name} patch`}
                      className="mt-2 w-24"
                    />
                  )}
                  <div className="mt-2 space-x-4">
                    {launch.links.article_link && (
                      <a
                        href={launch.links.article_link}
                        className="text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Article
                      </a>
                    )}
                    {launch.links.video_link && (
                      <a
                        href={launch.links.video_link}
                        className="text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Video
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {!filteredLaunches.length && <p className="text-center text-gray-300">No launches found.</p>}
        </div>
      </div>
    </div>
  );
}

export default SpaceXLaunches;
