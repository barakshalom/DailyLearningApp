
<script lang="ts">
    let LessonsList = ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Lesson 5", "Lesson 6", "Lesson 7", "Lesson 8", "Lesson 9", "Lesson 10"];

    let currentLesson = $state(LessonsList[0]);

    function SwitchLesson() {
        currentLesson = LessonsList[Math.floor(Math.random() * LessonsList.length)];
    }
</script>

<h1>{currentLesson}</h1>

<button onclick={() => SwitchLesson()}>Switch Lesson</button>
