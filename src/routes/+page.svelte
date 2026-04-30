
<script lang="ts">
    import { onMount } from 'svelte';
    
    let currentLesson : any = $state({});
    let str : string = $state("");

    async function fetchLesson() {
        try{
            const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentLesson = await response.json();
            str = currentLesson.thumbnail.source;
        }
        catch(error){
            console.error('Error fetching lesson:', error);
            currentLesson = { title: 'Error', extract: 'Could not fetch lesson. Please try again.'};
        }
    }

    function SwitchLesson() {
        fetchLesson();
    }

    onMount(() => {
        fetchLesson();
    });
    
</script>

<h1>{currentLesson.title}</h1>
<h2>{currentLesson.extract}</h2>
<img src={str} alt="Lesson Image" width="200" height="200"/>

<button onclick={() => SwitchLesson()}>Switch Lesson</button>
