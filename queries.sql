CREATE TABLE apiUsers (
    id VARCHAR(55) PRIMARY KEY,
    name VARCHAR(55),
    email VARCHAR(255),
    admin TINYINT(1) DEFAULT 0
);

CREATE TABLE apps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(55) UNIQUE,
    description VARCHAR(255) NOT NULL,
    link VARCHAR(55) NOT NULL,
    restricted TINYINT(1) DEFAULT 0,
    allUsers TINYINT(1) DEFAULT 0
);

CREATE TABLE apiUserAccess (
    appId INT,
    userId VARCHAR(55),
    PRIMARY KEY(appId, userId),
    FOREIGN KEY (userId) REFERENCES apiUsers(id) ON DELETE CASCADE
);

CREATE TABLE builds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    version VARCHAR(55) UNIQUE NOT NULL,
    ranBy VARCHAR(55) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (ranBy) REFERENCES apiUsers(id) ON DELETE CASCADE
);

CREATE TABLE buildChanges (
    buildId INT,
    appId INT,
    textId INT NOT NULL,
    text VARCHAR(255) NOT NULL,
    type VARCHAR(55) NOT NULL,
    PRIMARY KEY (buildId, appId, textId),
    FOREIGN KEY (buildId) REFERENCES builds(id) ON DELETE CASCADE,
    FOREIGN KEY (appId) REFERENCES apps(id) ON DELETE CASCADE
);

CREATE TABLE buildUserStatus (
    buildId INT,
    userId VARCHAR(55),
    seen TINYINT(1) DEFAULT 0,
    PRIMARY KEY (buildId, userId),
    FOREIGN KEY (buildId) REFERENCES builds(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES apiUsers(id) ON DELETE CASCADE
);

CREATE TABLE dailyLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    userId VARCHAR(55),
    amWeight DECIMAL(5, 1),
    sleepQuality INT,
    sleepHours INT,
    stress INT,
    mood INT,
    soreness INT,
    energy INT,
    pmWeight DECIMAL(5, 1),
    workoutComments VARCHAR(255),
    dayComments VARCHAR(255),
    UNIQUE (date, userId),
    FOREIGN KEY (userId) REFERENCES apiUsers(id) ON DELETE CASCADE
);

CREATE TABLE exerciseTypes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE,
    pictureUrl VARCHAR(255)
);


CREATE TABLE workoutLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId VARCHAR(55), 
    date VARCHAR(11) NOT NULL, 
    timeCompleted TIME, 
    comments VARCHAR(255),
    type VARCHAR(55),
    UNIQUE (userId, date),
    FOREIGN KEY (userId) REFERENCES apiUsers(id) ON DELETE CASCADE
);

CREATE TABLE workoutLogsExercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workoutId INT,
    exerciseId INT,
    restTime VARCHAR(55),
    comments VARCHAR(255),
    UNIQUE (workoutId, exerciseId),
    FOREIGN KEY (workoutId) REFERENCES workoutLogs(id) ON DELETE CASCADE,
    FOREIGN KEY (exerciseId) REFERENCES exerciseTypes(id) ON DELETE CASCADE
);

CREATE TABLE workoutLogsExercisesSets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workoutExerciseId INT,
    orderId INT,
    weight INT,
    reps INT,
    UNIQUE (workoutExerciseId, orderId),
    FOREIGN KEY (workoutExerciseId) REFERENCES workoutLogsExercises(id) ON DELETE CASCADE
);

CREATE TABLE workoutTemplates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId VARCHAR(55),
    name VARCHAR(55),
    comments VARCHAR(255),
    UNIQUE (userId, name),
    FOREIGN KEY (userId) REFERENCES apiUsers(id) ON DELETE CASCADE
);

CREATE TABLE workoutTemplatesExercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    templateId INT,
    exerciseId INT,
    restTime VARCHAR(55),
    comments VARCHAR(255),
    UNIQUE (templateId, exerciseId),
    FOREIGN KEY (templateId) REFERENCES workoutTemplates(id) ON DELETE CASCADE,
    FOREIGN KEY (exerciseId) REFERENCES exerciseTypes(id) ON DELETE CASCADE
);

CREATE TABLE workoutTemplatesExercisesSets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    templateExerciseId INT,
    orderId INT,
    reps INT NOT NULL,
    UNIQUE (templateExerciseId, orderId),
    FOREIGN KEY (templateExerciseId) REFERENCES workoutTemplatesExercises(id) ON DELETE CASCADE
);

--------------------INSERT STATEMENTS FOR PRE EXISTING DATA----------------------
insert into apps (name, description, link) values 