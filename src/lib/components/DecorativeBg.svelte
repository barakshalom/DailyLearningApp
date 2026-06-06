<div class="decor" aria-hidden="true">
	<svg class="blob blob-yellow" viewBox="0 0 200 200">
		<path
			d="M45,-58C57,-44,63,-24,62,-4C61,16,53,36,38,50C23,64,2,72,-18,68C-38,64,-58,48,-66,28C-74,8,-70,-16,-58,-36C-46,-56,-26,-70,-4,-66C18,-62,33,-72,45,-58Z"
			transform="translate(100 100)"
			fill="var(--yellow)"
		/>
	</svg>
	<svg class="blob blob-lavender" viewBox="0 0 200 200">
		<path
			d="M39,-48C51,-35,61,-18,63,1C65,20,59,40,44,54C29,68,5,76,-18,72C-41,68,-62,52,-68,31C-74,10,-65,-16,-52,-34C-39,-52,-20,-62,0,-62C20,-62,27,-61,39,-48Z"
			transform="translate(100 100)"
			fill="var(--lavender)"
		/>
	</svg>
	<svg class="squiggle" viewBox="0 0 120 40" fill="none">
		<path
			d="M5 25C25 5 45 35 65 15C85 0 100 30 115 20"
			stroke="var(--yellow)"
			stroke-width="2"
			stroke-linecap="round"
		/>
	</svg>
	<svg class="star-accent" viewBox="0 0 24 24" fill="var(--mint)">
		<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
	</svg>
</div>

<style>
	.decor {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
	}

	.blob {
		position: absolute;
		opacity: 0.2;
	}

	.blob-yellow {
		width: 280px;
		height: 280px;
		top: -80px;
		left: -60px;
	}

	.blob-lavender {
		width: 220px;
		height: 220px;
		bottom: 120px;
		right: -40px;
	}

	.squiggle {
		position: absolute;
		width: 100px;
		height: 40px;
		top: 180px;
		right: 10%;
		opacity: 0.25;
	}

	.star-accent {
		position: absolute;
		width: 20px;
		height: 20px;
		top: 100px;
		left: 8%;
		opacity: 0.35;
	}

	@media (min-width: 900px) {
		.blob-yellow {
			width: 360px;
			height: 360px;
		}

		.blob-lavender {
			width: 300px;
			height: 300px;
		}
	}
</style>
