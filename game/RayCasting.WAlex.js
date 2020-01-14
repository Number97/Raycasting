var world = [ 	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
				[1, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 1],
				[1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 1],
				[5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 3, 0, 0, 5, 0, 5, 0, 0, 1],
				[1, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]

/*world = [[5,5,5,5,5],
		[5,0,0,0,5],
		[5,0,0,0,5],
		[5,0,0,0,5],
		[5,5,5,5,5]]*/

var world_size = 12

var cam = new Camera()

var wall_height = 600
var distance_between_lines
var speed = 2

var grid_x
var grid_y
var grid_size

var noiseVal = 0.0

var show_rays = true

function drawGrid(g_x, g_y, g_size)
{
	grid_x = g_x
	grid_y = g_y
	grid_size = g_size

	distance_between_lines = grid_size / world_size

	strokeWeight(1)
	stroke(0)

	for(var y = 0; y < world_size; y++)
		for(var x = 0; x < world_size; x++)
		{
			fill(getWallColor(x, y))
			rect(grid_x + x * distance_between_lines, grid_y + y * distance_between_lines, distance_between_lines, distance_between_lines)

		}

	for(var y = 0; y < world_size; y++)
	{
		line(grid_x, grid_y + y * distance_between_lines, grid_x + grid_size, grid_y + y * distance_between_lines)
	}
	for(var x = 0; x < world_size; x++)
	{
		line(grid_x + x * distance_between_lines, grid_y, grid_x + x * distance_between_lines, grid_y + grid_size)
	}

	var x3 = cam.x * distance_between_lines  + 1000 * cos(cam.rotation - cam.fov / 2)
	var y3 = cam.y * distance_between_lines  - 1000 * sin(cam.rotation - cam.fov / 2)

	var x4 = cam.x * distance_between_lines  + 1000 * cos(cam.rotation + cam.fov / 2)
	var y4 = cam.y * distance_between_lines  - 1000 * sin(cam.rotation + cam.fov / 2)
	
	stroke('red')
	line(grid_x + cam.x * distance_between_lines , grid_y + cam.y * distance_between_lines , grid_x + x3, grid_y + y3)
	line(grid_x + cam.x * distance_between_lines , grid_y + cam.y * distance_between_lines , grid_x + x4, grid_y + y4)
	
	fill('red')
	ellipse(grid_x + cam.x * distance_between_lines , grid_y + cam.y * distance_between_lines , 10, 10)
}

function raycast(screen_x, screen_y, screen_width, screen_height)
{
	var distance_from_wall = screen_width / 2 / tan(cam.fov / 2)
	var angle_between_rays = cam.fov / screen_width

	var ray_angle = cam.rotation + cam.fov / 2
	
	stroke(0)

	fill(220)
	rect(screen_x,screen_y,screen_width,screen_height / 2)

	fill(150)
	rect(screen_x,screen_y + screen_height / 2,screen_width,screen_height / 2)

	for(var line_x = screen_x; line_x < screen_x + screen_width; line_x++)
	{
		if(ray_angle > 360) ray_angle -= 360
	    else if(ray_angle < 0) ray_angle += 360

	    var angle = ray_angle

		// NEW ALGORITHM

		var orientation

		var l_h = (angle > 180 ? 1-cam.y%1 : cam.y%1) / tan(angle) * (angle > 180 ? -1 : 1)
		var x_h = cam.x + l_h
		var y_h = cam.y + (angle > 180 ? 1 - cam.y%1 : - cam.y%1)
		
		var l_v = (angle < 90 || angle > 270 ? 1-cam.x%1: cam.x%1) * tan(angle) * (angle < 90 || angle > 270 ? -1 : 1)
		var x_v = cam.x + (angle < 90 || angle > 270 ? 1 - cam.x%1 : -cam.x%1)
		var y_v = cam.y + l_v

		var bloc_x
		var bloc_y

		var ray_x = cam.x
		var ray_y = cam.y

		var last_x = cam.x
		var last_y = cam.y 

		var final_distance = 0

		do
		{
			var dist_h = (x_h - ray_x) * (x_h - ray_x) + (y_h - ray_y) * (y_h - ray_y)
			var dist_v = (x_v - ray_x) * (x_v - ray_x) + (y_v - ray_y) * (y_v - ray_y)

			if(dist_h < dist_v)
			{
				orientation = 0

				ray_x = x_h
				ray_y = y_h

				x_h = x_h +  1 / tan(angle) * (angle > 180 ? -1 : 1)
				y_h = y_h + (angle > 180 ? 1 : -1)

				bloc_x = int(ray_x)
				bloc_y = (angle > 180 ? int(ray_y) : int(ray_y - 1))
			}
			else
			{
				orientation = 1

				ray_x = x_v
				ray_y = y_v

				x_v = x_v + (angle < 90 || angle > 270 ? 1 : -1)
				y_v = y_v + tan(angle) * (angle < 90 || angle > 270 ? -1 : 1)	

				bloc_x = (angle < 90 || angle > 270 ? int(ray_x) : int(ray_x - 1))
				bloc_y = int(ray_y)	
			}
			
			final_distance += sqrt((last_x - ray_x) * (last_x - ray_x) + (last_y - ray_y) * (last_y - ray_y))

			stroke('blue')
			if(show_rays && line_x%50 == 0) line(grid_x + last_x * distance_between_lines, grid_y + last_y * distance_between_lines, grid_x + ray_x*distance_between_lines, grid_y + ray_y*distance_between_lines)
			
			if(final_distance > 20) break

			last_x = ray_x
			last_y = ray_y

			if(world[bloc_x][bloc_y] == 5)
			{
				drawLine(final_distance)

				if(orientation == 0)
				{
					angle = -angle

					if(angle < 0) angle += 360
					else if(angle > 360) angle -= 360

					x_h = ray_x
					y_h = ray_y

					x_h = x_h +  1 / tan(angle) * (angle > 180 ? -1 : 1)
					y_h = y_h + (angle > 180 ? 1 : -1)

					l_v = (angle < 90 || angle > 270 ? 1-ray_x%1: ray_x%1) * tan(angle) * (angle < 90 || angle > 270 ? -1 : 1)
					x_v = ray_x + (angle < 90 || angle > 270 ? 1 - ray_x%1 : -ray_x%1)
					y_v = ray_y + l_v
				}
				else
				{
					angle = 180 - angle

					if(angle < 0) angle += 360
					else if(angle > 360) angle -= 360

					x_v = ray_x
					y_v = ray_y

					x_v = x_v + (angle < 90 || angle > 270 ? 1 : -1)
					y_v = y_v + tan(angle) * (angle < 90 || angle > 270 ? -1 : 1)	

					
					l_h = (angle > 180 ? 1-ray_y%1 : ray_y%1) / tan(angle) * (angle > 180 ? -1 : 1)
					x_h = ray_x + l_h
					y_h = ray_y + (angle > 180 ? 1 - ray_y%1 : - ray_y%1)
				}
			}
			else if(world[bloc_x][bloc_y] != 0) break

		}while(bloc_x >= 0 && bloc_x < world_size && bloc_y >= 0 && bloc_y < world_size)
		
		stroke('blue')
		//if(show_rays) line(grid_x + cam.x * distance_between_lines, grid_y + cam.y * distance_between_lines, grid_x + ray_x*distance_between_lines, grid_y + ray_y*distance_between_lines)

		// DRAWING 

		drawLine(final_distance)

		function drawLine(distance)
		{
			var line_height = distance_from_wall / distance
			var top_bottom_offset = (screen_height - line_height) / 2

			var line_color = getWallColor(bloc_x, bloc_y)
			var final_line_color = lerpColor(line_color, color(0), map(distance, 1, 10, 0, 0.9))

			if(orientation == 0) final_line_color = lerpColor(final_line_color, color(0), 0.3)

			stroke(final_line_color)
			strokeWeight(1)
			line(line_x, screen_y + max(0, top_bottom_offset), line_x, screen_y + min(screen_height, screen_height - top_bottom_offset))
        }

        ray_angle -= angle_between_rays
	}
}

function getWallColor(x, y)
{
	if(world[x][y] == 0) return color(255)
	else if(world[x][y] == 1) return color(100)
	else if(world[x][y] == 2) return color('red')	
	else if(world[x][y] == 3) return color('green')
	else if(world[x][y] == 4) return color(random(0,255))
	else if(world[x][y] == 5) return color(map(noise(noiseVal),0,1,0,255),map(noise(noiseVal+60),0,1,0,255),map(noise(noiseVal+120),0,1,0,255))
	else return color('yellow')
}

function Player(x, y)
{
	this.x = x
	this.y = y
	this.rotation = 0
}

function Camera()
{
	this.height = wall_height / 2
	this.rotation = 10
	this.fov = 60
	this.x = 5.5
	this.y = 5.3
}

function setup() 
{
	createCanvas(800 + 400, 600)

	angleMode(DEGREES)
}

function randomizeMap()
{	
	for(var y = 1; y < world_size-1; y++)
		for(var x = 1; x < world_size-1; x++)
		{
			if(random(0,1) < 0.1 && (x != int(cam.x) || y != int(cam.y))) world[x][y] = int(random(2,5))
			else world[x][y] = 0
		}
}

function draw()
{	
	noiseVal+=0.01;
	background(50)

	drawGrid(800, 200, 400)
	raycast(0,0,800,600)

    if(keyIsDown(66)) cam.fov++
    else if(keyIsDown(78)) cam.fov--

    if (keyIsDown(LEFT_ARROW)) cam.rotation += 3 * speed
 	else if (keyIsDown(RIGHT_ARROW)) cam.rotation -= 3 * speed

 	if(keyIsDown(65)) randomizeMap()

 	if(keyIsDown(UP_ARROW) || keyIsDown(DOWN_ARROW))
 	{
 		var direction

 		if(keyIsDown(UP_ARROW)) direction = 1
 		else direction = -1

 		var next_x = cam.x + 0.1 * cos(cam.rotation) * direction * speed /4 
 		var next_y = cam.y - 0.1 * sin(cam.rotation) * direction * speed /4 

 		if(world[int(next_x)][int(next_y)] == 0)
 		{
 			cam.x = next_x
 			cam.y = next_y
 		}
 	}

 	if(cam.rotation > 360) cam.rotation -= 360
	if(cam.rotation < 0) cam.rotation += 360
}