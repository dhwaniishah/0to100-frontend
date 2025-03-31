// src/mockData/products.js
import alloyWheelImg from '../assets/alloy-wheel.avif';
import brakePadsImg from '../assets/brake-pads.jpg';
import chromeWheelsImg from '../assets/chrome-wheels.jpg';
import brakeRotorsImg from '../assets/brake-rotors.jpg';
import suspensionKitImg from '../assets/suspension-kit.jpg';
import headlightsImg from '../assets/headlights.webp';
import airFilterImg from '../assets/air-filter.jpg';
import shockAbsorbersImg from '../assets/shock-absorbers.jpg';
import offRoadTiresImg from '../assets/off-road-tires.jpg';
import exhaustSystemImg from '../assets/exhaust-system.webp';
import brakeCalipersImg from '../assets/brake-calipers.jpg';
import allSeasonTiresImg from '../assets/all-season-tires.jpg';

const products = [
  {
    id: 1,
    title: "Premium Alloy Wheels",
    description: "19-inch lightweight performance wheels",
    price: 299.99,
    image: alloyWheelImg,
    category: "Wheels",
    company: "SpeedMaster"
  },
  {
    id: 2,
    title: "Performance Brake Pads",
    description: "Ceramic brake pads with reduced dust",
    price: 89.99,
    image: brakePadsImg,
    category: "Brakes",
    company: "StopTech"
  },
  {
    id: 3,
    title: "Chrome Wheel Rims",
    description: "Set of 4 polished chrome rims",
    price: 249.99,
    image: chromeWheelsImg,
    category: "Wheels",
    company: "RimPro"
  },
  {
    id: 4,
    title: "Brake Rotors",
    description: "Slotted and drilled for better cooling",
    price: 129.99,
    image: brakeRotorsImg,
    category: "Brakes",
    company: "StopTech"
  },
  {
    id: 5,
    title: "Coilover Suspension Kit",
    description: "Adjustable height and dampening",
    price: 599.99,
    image: suspensionKitImg,
    category: "Suspension",
    company: "RideControl"
  },
  {
    id: 6,
    title: "LED Headlight Set",
    description: "Bright white LED replacement headlights",
    price: 159.99,
    image: headlightsImg,
    category: "Lighting",
    company: "BrightPath"
  },
  {
    id: 7,
    title: "Performance Air Filter",
    description: "High-flow washable air filter",
    price: 49.99,
    image: airFilterImg,
    category: "Engine",
    company: "PowerFlow"
  },
  {
    id: 8,
    title: "Shock Absorbers",
    description: "Heavy-duty shocks for improved handling",
    price: 189.99,
    image: shockAbsorbersImg,
    category: "Suspension",
    company: "RideControl"
  },
  {
    id: 9,
    title: "Off-Road Tires",
    description: "All-terrain tires with aggressive tread",
    price: 219.99,
    image: offRoadTiresImg,
    category: "Tires",
    company: "TrailMaster"
  },
  {
    id: 10,
    title: "Sport Exhaust System",
    description: "Stainless steel performance exhaust",
    price: 349.99,
    image: exhaustSystemImg,
    category: "Exhaust",
    company: "FlowMax"
  },
  {
    id: 11,
    title: "Brake Calipers",
    description: "Powder-coated performance calipers",
    price: 279.99,
    image: brakeCalipersImg,
    category: "Brakes",
    company: "StopTech"
  },
  {
    id: 12,
    title: "All-Season Tires",
    description: "Balanced performance in all conditions",
    price: 189.99,
    image: allSeasonTiresImg,
    category: "Tires",
    company: "RoadGrip"
  },
];

export default products;