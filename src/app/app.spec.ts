'use strict';

/// <reference types="jest" />

import { App } from "./";

test("Can create an App and run a test on it", () => {
    // Arrange - Act
    const app: App = new App();

    // Assert
    expect(app).toBeTruthy()
});