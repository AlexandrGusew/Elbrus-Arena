import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { classData } from '../data/gameData';
import { CharacterClass } from '../types/game';

interface CharacterCreationPageProps {
  onCreate: (name: string, characterClass: CharacterClass) => void;
}

export function CharacterCreationPage({ onCreate }: CharacterCreationPageProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  
  const handleCreate = () => {
    if (name.trim() && selectedClass) {
      onCreate(name.trim(), selectedClass);
    }
  };
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1>Create Character</h1>
          <div className="ornate-divider" />
        </div>
        
        {/* Name Input */}
        <div className="max-w-md mx-auto">
          <Input
            label="Character Name"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        {/* Class Selection */}
        <div className="space-y-4">
          <h3 className="text-center">Select Your Class</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(classData) as CharacterClass[]).map((classKey) => {
              const classInfo = classData[classKey];
              const isSelected = selectedClass === classKey;
              
              return (
                <Card
                  key={classKey}
                  selected={isSelected}
                  glow={isSelected ? 'gold' : 'none'}
                  onClick={() => setSelectedClass(classKey)}
                  className="cursor-pointer"
                >
                  <div className="text-center space-y-4">
                    {/* Icon */}
                    <div className="text-6xl">{classInfo.icon}</div>
                    
                    {/* Name */}
                    <h3 className="text-[#d4a574]">{classInfo.name}</h3>
                    
                    {/* Description */}
                    <p className="text-xs text-[#b8a890] leading-relaxed">
                      {classInfo.description}
                    </p>
                    
                    {/* Base Stats */}
                    <div className="space-y-2 pt-4 border-t border-[#6b5840]">
                      <div className="text-xs text-[#d4a574] uppercase tracking-wider">Base Stats</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#b8a890]">❤️ Health:</span>
                          <span className="text-[#e8dcc8]">{classInfo.baseStats.health}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b8a890]">💪 Strength:</span>
                          <span className="text-[#e8dcc8]">{classInfo.baseStats.strength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b8a890]">⚡ Instinct:</span>
                          <span className="text-[#e8dcc8]">{classInfo.baseStats.instinct}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b8a890]">🏃 Agility:</span>
                          <span className="text-[#e8dcc8]">{classInfo.baseStats.agility}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Create Button */}
        <div className="flex justify-center pt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
            disabled={!name.trim() || !selectedClass}
          >
            Create Character
          </Button>
        </div>
      </div>
    </div>
  );
}