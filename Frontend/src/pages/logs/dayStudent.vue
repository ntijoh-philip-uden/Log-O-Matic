<template>
    <v-container class="spacing-playground pa-8">
        <v-card
        class="mx-auto"
        elevation="8"
        max-width="448"
        rounded="lg"
        >
            <v-card-text class="text-medium-emphasis font-weight-bold justify-center align-center fill-height d-flex text-h5">
                Monday Week 48
            </v-card-text>
            <v-radio-group inline class="d-flex justify-center align-center ">
                <v-radio label="One at a Time" value="one" class="mr-4"></v-radio>
                <v-radio label="All at Once" value="two"></v-radio>
            </v-radio-group>
            <v-carousel
                height="80"
                hide-delimiters
            >
                <v-carousel-item>
                <v-sheet
                    height="100%"
                >
                    <v-card-text class="d-flex fill-height justify-center align-center">
                        1
                    </v-card-text>
                </v-sheet>
                </v-carousel-item>
                <v-carousel-item>
                <v-sheet
                    height="100%"
                >
                    <v-card-text class="d-flex fill-height justify-center align-center">
                        2
                    </v-card-text>
                </v-sheet>
                </v-carousel-item>
                <v-carousel-item>
                <v-sheet
                    height="100%"
                >
                    <v-card-text class="d-flex fill-height justify-center align-center">
                        3
                    </v-card-text>
                </v-sheet>
                </v-carousel-item>
            </v-carousel>
        </v-card>
        <v-card
        class="mx-auto mt-8"
        elevation="8"
        max-width="800"
        rounded="lg"
        >

            <v-container>
                <v-card 
                    width="100%"
                    class="border-b-lg pa-2"
                >
                    <v-card-title>
                        Vad har du gjort under dagen?
                    </v-card-title>
                    <v-card-text>
                        ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                    </v-card-text>
                </v-card>

                <v-card 
                    width="100%"
                    class="border-b-lg pa-2"
                >
                    <v-card-title>
                        Vad har du lärt dig?
                    </v-card-title>
                    <v-card-text>
                        ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                    </v-card-text>
                </v-card>

                <v-card 
                    width="100%"
                    class="border-b-lg pa-2"
                >
                    <v-card-title>
                        Vad förstod du inte / Vilka frågor har du inte fått svar på?
                    </v-card-title>
                    <v-card-text>
                        ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                    </v-card-text>
                </v-card>

                <v-card 
                    width="100%"
                    class="border-b-lg pa-2"
                >
                    <v-card-title>
                        Vad vill du lära dig mer om?
                    </v-card-title>
                    <v-card-text>
                        ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                    </v-card-text>
                </v-card>
            </v-container>



            <v-timeline 
                align="start"
                width="100%"
                class="border-b-lg pa-8"
            >
                <v-timeline-item>
                <template v-slot:opposite>
                    Daniel Berg
                </template>
                <div>
                    <div class="text-h6">Content title</div>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>
                </v-timeline-item>

                <v-timeline-item>
                <template v-slot:opposite>
                    Örjan Lax
                </template>
                <div>
                    <div class="text-h6">Content title</div>
                    <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>
                </v-timeline-item>
            </v-timeline>

        </v-card>

    </v-container>
</template>

<script>
    export default {
        
    }
</script>

<style lang="scss" scoped>

</style>