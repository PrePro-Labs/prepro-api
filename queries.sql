-- For any row that has a FK, if the corresponding PK is deleted, I want to cascade and delete related rows

create table apiUsers (
    id varchar(55) primary key,
    name varchar(55),
    email varchar(255),
    admin bool default(0)
);

create table apiUserAccess (
    appId int,
    userId varchar(55), -- fk apiUsers.id
    unique(appId, userId)
);

create table apps (
    id int primary key auto_increment,
    name varchar(55) unique,
    description varchar(255) not null,
    link varchar(55) not null,
    restricted bool default(0)
);

create table builds (
    id int primary key auto_increment,
    version varchar(55) unique, -- do you need to specify not null as well?
    ranBy varchar(55) not null, -- fk apiUsers.id
    date date not null
);

create table buildChanges (
    buildId int, -- fk builds.id
    appId int, -- fk apps.appId
    textId int not null,
    text varchar(255) not null,
    type varchar(55) not null,
    primary key(buildId, appId, textId)
);

create table buildUserStatus (
    buildId int, -- fk builds.id
    userId varchar(55), -- fk apiUsers.id
    seen bool default(0),
    primary key(buildId, userId, seen)
);

create table dailyLogs (
    id int primary key auto_increment,l
    date date not null,
    userId varchar(55), -- fk apiUsers.id
    amWeight int, -- needs to include 1 decimal place...
    sleepQuality int,
    sleepHours int,
    stress int,
    mood int,
    soreness int,
    energy int,
    pmWeight int, --same as amWeight
    workoutComments varchar(255),
    dayComments varchar(255),
    unique(date, userId)
);

create table exerciseTypes (
    id int primary key auto_increment,
    name varchar(255) unique, 
    pictureUrl varchar(255)
);

create table workoutLogs (
    id int primary key auto_increment,
    userId varchar(55), -- fk apiUsers.id
    date varchar(11),
    timeCompleted time, -- not sure what the datatype for this one is, its XX:xx:xx
    comments varchar(255),
    type varchar(55),
    unique(userId, date)
);

create table workoutLogsExercises (
    id int primary key auto_increment,
    workoutId int, -- pk workoutLogs.id
    exerciseId int, -- pk exerciseTypes.id
    restTime varchar(55),
    comments varchar(255),
    unique(workoutId, exerciseId)
);

create table workoutLogsExercisesSets (
    id int primary key auto_increment,
    workoutExerciseId int, -- fk workoutExercises.id
    orderId int,
    weight int,
    reps int,
    unique(workoutExerciseId, orderId)
);

create table workoutTemplates (
    id int primary key auto_increment,
    userId varchar(55), -- fk apiUsers.id
    name varchar(55),
    unique(userId, name)
);

create table workoutTemplatesExercises (
    id int primary key auto_increment,
    templateId int, -- fk workoutTemplates.id
    exerciseId int, -- fk exerciseTypes.id
    restTime varchar(55),
    comments varchar(255),
    unique(templateId, exerciseId)
);

create table workoutTemplatesExercisesSets (
    id int primary key auto_increment,
    templateExerciseId int, -- fk workoutTemplatesExercises.id
    orderId int,
    reps int not null,
    unique(templateExerciseId, orderId)
);

--------------------INSERT STATEMENTS FOR PRE EXISTING DATA----------------------
insert into apps (name, description, link) values 