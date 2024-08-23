create table workoutTemplates (
    id int primary key auto_increment,
    userId varchar(55),
    name varchar(55),
    unique(userId, name)
);

create table workoutTemplateExercises (
    id int primary key auto_increment,
    templateId int,
    exerciseId int,
    unique(templateId, exerciseId)
);

create table workoutTemplateExerciseSets (
    id int primary key auto_increment,
    templateExerciseId int,
    orderId int,
    reps int not null,
    unique(templateExerciseId, orderId)
);

