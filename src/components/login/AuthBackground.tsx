import React from 'react';
import { Sun } from './elements/Sun';
import { Hill } from './elements/Hill';
import { Birds } from './elements/Birds';
import { Airplane } from './elements/Airplane';
import { Waves } from './elements/Waves';
import { Tree } from './elements/Tree';

export const AuthBackground = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <Sun />
            <Hill />
            <Birds />
            <Airplane />
            <Waves />
            <Tree />
        </div>
    );
};
