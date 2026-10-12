import React, { useState } from 'react';
import { Droplet, Wind, Users, Sparkles, Scale } from 'lucide-react';

export const FoodWasteCalculator: React.FC = () => {
  const [mealsCount, setMealsCount] = useState<number>(150);

  // Environmental impact multipliers based on EPA / FAO food waste statistics:
  // 1 meal (~0.5 kg) saves approx 1.9 kg of CO2 equivalent emissions
  // 1 meal represents approx 850 liters of agricultural fresh water footprint
  // 1 meal feeds 1 person
  const co2Saved = Math.round(mealsCount * 1.9);
  const waterSaved = Math.round(mealsCount * 850);
  const peopleFed = mealsCount;
  const carMilesEquivalent = Math.round(co2Saved * 2.4);

  const presets = [
    { label: 'Family Dinner (10 meals)', value: 10 },
    { label: 'Catered Luncheon (50 meals)', value: 50 },
    { label: 'Hotel Banquet (150 meals)', value: 150 },
    { label: 'Convention Buffet (500 meals)', value: 500 },
  ];

  return (
    <div className="bg-[#245C45] text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
      {/* Background organic blur accents */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#6FAF78]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#F4A261]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#EBF5ED] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#F4A261]" />
            Interactive Environmental Impact Calculator
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            See What Your Surplus Food Can Save
          </h3>
          <p className="text-sm text-white/80 mt-2">
            Food rotting in landfills creates potent methane gas. Slide to see how surplus food redistribution creates immediate planetary and humanitarian relief.
          </p>
        </div>

        {/* Slider & Presets */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#F4A261]" />
              Estimated Surplus Meals:
            </label>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-[#F4A261] font-heading">{mealsCount}</span>
              <span className="text-sm text-white/80 font-medium">meals</span>
            </div>
          </div>

          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={mealsCount}
            onChange={(e) => setMealsCount(Number(e.target.value))}
            className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F4A261] focus:outline-none"
          />

          <div className="flex items-center justify-between text-xs text-white/60 mt-2 font-mono">
            <span>10 meals</span>
            <span>250 meals</span>
            <span>500 meals</span>
            <span>1,000 meals</span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-white/70 mr-1">Quick Scenarios:</span>
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setMealsCount(preset.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mealsCount === preset.value
                    ? 'bg-[#F4A261] text-[#25312B] shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Impact Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-[#6FAF78]/20 text-[#6FAF78] flex items-center justify-center mb-3">
              <Wind className="w-5 h-5" />
            </div>
            <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Greenhouse Gases</p>
            <h4 className="text-2xl font-black text-white mt-1 font-heading">{co2Saved.toLocaleString()} kg</h4>
            <p className="text-xs text-[#6FAF78] mt-1 font-medium">
              CO₂e emissions prevented (~{carMilesEquivalent} car miles)
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3">
              <Droplet className="w-5 h-5" />
            </div>
            <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Fresh Water Saved</p>
            <h4 className="text-2xl font-black text-white mt-1 font-heading">{waterSaved.toLocaleString()} L</h4>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              Conserved agricultural embedded water footprint
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-[#F4A261]/20 text-[#F4A261] flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">People Nourished</p>
            <h4 className="text-2xl font-black text-[#F4A261] mt-1 font-heading">{peopleFed.toLocaleString()}</h4>
            <p className="text-xs text-white/80 mt-1 font-medium">
              Full warm meals delivered to community pantries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
